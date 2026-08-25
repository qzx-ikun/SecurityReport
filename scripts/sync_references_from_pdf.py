from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

import fitz


REFERENCE_PAGE_START = 182
REFERENCE_PAGE_END = 246
SECTION_HEADINGS = {
    "参考文献",
    "期刊论文",
    "会议论文",
    "政府政策与报告",
    "预印本论文",
    "技术文档",
    "学术与项目主页",
}

# These six records reconcile the bibliography metadata with Figure 1.3 in the
# report: 362 preprints, 116 conference papers, and 29 journal papers.
TYPE_OVERRIDES = {
    "jamshidi2026collectivehallucination": "misc",
    "lu2026vulnerabilityreasoning": "misc",
    "khanSAFER2025": "inproceedings",
    "christodorescu2026agent": "inproceedings",
    "b3bench2026": "inproceedings",
    "li2026agentharness": "misc",
}

CITATION_OVERRIDES = {
    604: (
        "J. Li et al., Agent harness engineering: A survey, 2026. "
        "arXiv: 2603.12230. [Online]. Available: "
        "https://openreview.net/pdf?id=eONq7FdiHa"
    ),
    1120: (
        "S. Jamshidi, Collective hallucination in multi-agent LLMs: Modeling and defense, "
        "Jun. 2026. arXiv: 2606.07941. Accessed: Jul. 30, 2026. [Online]. Available: "
        "https://arxiv.org/abs/2606.07941"
    ),
    1121: (
        "L. Lu, Y. Zhao, H. Rao, K. Zhang, and H. Wang, Evaluating and enhancing the "
        "vulnerability reasoning capabilities of large language models, Feb. 2026. "
        "arXiv: 2602.06687. Accessed: Jul. 30, 2026. [Online]. Available: "
        "https://arxiv.org/abs/2602.06687"
    ),
}


def load_data(source: str) -> dict:
    match = re.search(r"const DATA = (\{.*\}) as const;", source, re.DOTALL)
    if not match:
        raise ValueError("Could not find the DATA object")
    return json.loads(match.group(1))


def should_keep_wrap_hyphen(left: str, right: str, reference_text: str) -> bool:
    left_match = re.search(r"([A-Za-z]+)-$", left)
    right_match = re.match(r"([A-Za-z]+)", right)
    if not left_match or not right_match:
        return False

    left_part = left_match.group(1)
    right_part = right_match.group(1)
    haystack = reference_text.casefold()
    hyphenated = f"{left_part}-{right_part}".casefold()
    joined = f"{left_part}{right_part}".casefold()

    if hyphenated in haystack:
        return True
    if joined in haystack:
        return False
    return False


def join_wrapped_lines(lines: list[str], reference_text: str) -> str:
    result = ""

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        if not result:
            result = line
            continue

        previous_token = result.rsplit(" ", 1)[-1]
        available_tail = (
            result.rsplit("Available:", 1)[1]
            if "Available:" in result
            else ""
        )
        in_wrapped_url = (
            bool(available_tail.strip())
            or
            previous_token.startswith(("htt", "www.", "doi.", "10."))
            or "://" in previous_token
        )

        if result.endswith("-") and line[0].isalpha():
            if should_keep_wrap_hyphen(result, line, reference_text):
                result += line
            else:
                result = result[:-1] + line
        elif line[0] in ".,/?:;&%#" or (result[-1].isdigit() and line[0].isdigit()):
            result += line
        elif in_wrapped_url:
            result += line
        elif previous_token in {"htt", "http", "https", "arxiv.or", "arxi", "ww", "w"}:
            result += line
        else:
            result += " " + line

    result = re.sub(r"\s+", " ", result).strip()
    if "Available:" in result:
        prefix, url = result.rsplit("Available:", 1)
        clean_url = re.sub(r"\s+", "", url)
        result = f"{prefix}Available: {clean_url}"
    return result


def extract_pdf_references(pdf_path: Path, data: dict) -> dict[int, str]:
    references_by_number = {entry["number"]: entry for entry in data["references"]}
    bib_by_key = {entry["key"]: entry for entry in data["bib"]}
    extracted: dict[int, str] = {}
    current_number: int | None = None
    current_lines: list[str] = []

    def flush() -> None:
        nonlocal current_number, current_lines
        if current_number is None:
            return
        reference = references_by_number[current_number]
        bib = bib_by_key.get(reference.get("key", ""), {})
        reference_text = " ".join(
            str(value)
            for value in (
                reference.get("citation", ""),
                bib.get("title", ""),
                bib.get("author", ""),
                bib.get("venue", ""),
                bib.get("url", ""),
            )
        )
        extracted[current_number] = join_wrapped_lines(current_lines, reference_text)
        current_number = None
        current_lines = []

    document = fitz.open(pdf_path)
    for page_number in range(REFERENCE_PAGE_START, REFERENCE_PAGE_END + 1):
        page = document[page_number - 1]
        for block in page.get_text("blocks", sort=True):
            _, y0, _, y1, text, *_ = block
            if y0 < 45 or y1 > page.rect.height - 45:
                continue
            stripped = text.strip()
            if not stripped or stripped in SECTION_HEADINGS:
                continue

            match = re.match(r"^\[(\d+)\]\s*\n?(.*)$", stripped, re.DOTALL)
            if match:
                flush()
                current_number = int(match.group(1))
                current_lines = match.group(2).splitlines()
            elif current_number is not None:
                current_lines.extend(stripped.splitlines())

    flush()
    return extracted


def clean_bib_text(value: str) -> str:
    replacements = {
        r"\&": "&",
        r"\$": "$",
        r"\S": "§",
        "---": " - ",
        "--": "-",
        "{": "",
        "}": "",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return re.sub(r"\s+", " ", value).strip()


def format_author_name(name: str) -> str:
    name = clean_bib_text(name)
    if "," not in name or name.upper() == name:
        return name

    family, given = (part.strip() for part in name.split(",", 1))
    initials = " ".join(
        f"{part[0]}."
        for part in re.findall(r"[A-Za-z]+", given)
        if part
    )
    return f"{initials} {family}".strip()


def format_authors(author_field: str) -> str:
    names = [
        format_author_name(name)
        for name in re.split(r"\s+and\s+", author_field)
        if name.strip()
    ]
    if not names:
        return ""
    if len(names) > 6:
        return f"{names[0]} et al."
    if len(names) == 1:
        return names[0]
    if len(names) == 2:
        return f"{names[0]} and {names[1]}"
    return f"{', '.join(names[:-1])}, and {names[-1]}"


def extract_url_from_citation(citation: str) -> str:
    available = re.search(r"Available:\s*(.+)$", citation)
    if available:
        candidate = re.sub(
            r"\s+\d+\s+AI\s+智能体安全调研报告\s*$",
            "",
            available.group(1),
        )
        return re.sub(r"\s+", "", candidate)

    inline = re.search(
        r"(https?://.+?)(?=,\s*(?:19|20)\d{2}\.?$|$)",
        citation,
    )
    return re.sub(r"\s+", "", inline.group(1)) if inline else ""


def preferred_url(reference: dict, bib: dict) -> str:
    bib_url = clean_bib_text(bib.get("url", ""))
    if bib_url:
        return bib_url

    candidates = [
        clean_bib_text(reference.get("url", "")),
        extract_url_from_citation(reference.get("citation", "")),
    ]
    candidates = [candidate for candidate in candidates if candidate]
    return max(candidates, key=len) if candidates else ""


def build_web_only_citations(
    data: dict,
    pdf_references: dict[int, str],
) -> dict[int, str]:
    bib_by_key = {entry["key"]: entry for entry in data["bib"]}
    citations: dict[int, str] = {}

    for reference in data["references"]:
        number = reference["number"]
        if number in pdf_references or number in CITATION_OVERRIDES:
            continue

        bib = bib_by_key[reference["key"]]
        if bib["type"] not in {"news", "others"} and number != 308:
            continue

        authors = format_authors(bib.get("author", ""))
        title = clean_bib_text(bib.get("title", ""))
        venue = clean_bib_text(bib.get("venue", ""))
        year = clean_bib_text(bib.get("year", ""))
        url = preferred_url(reference, bib)

        citation = f"{authors}, " if authors else ""
        if title:
            citation += f"“{title},”"
        if venue:
            citation += f" {venue},"
        if year:
            citation += f" {year}."
        else:
            citation = citation.rstrip(", ") + "."

        accessed = re.search(
            r"Accessed:\s*([A-Z][a-z]{2}\.\s+\d{1,2},\s+\d{4})",
            reference.get("citation", ""),
        )
        if accessed:
            citation += f" Accessed: {accessed.group(1)}."
        if url:
            citation += f" [Online]. Available: {url}"

        citations[number] = citation

    return citations


def replace_reference_blocks(
    source: str,
    data: dict,
    extracted: dict[int, str],
) -> str:
    bib_by_key = {entry["key"]: entry for entry in data["bib"]}
    reference_pattern = re.compile(
        r'(?ms)^    \{\r?\n'
        r'      "number": (?P<number>\d+),\r?\n'
        r'(?P<key_line>      "key": "(?:\\.|[^"\\])*",\r?\n)?'
        r'      "citation": "(?:\\.|[^"\\])*",\r?\n'
        r'      "url": "(?:\\.|[^"\\])*"\r?\n'
        r'    \}'
    )

    def replacement(match: re.Match[str]) -> str:
        number = int(match.group("number"))
        if number not in extracted:
            return match.group(0)

        reference = next(item for item in data["references"] if item["number"] == number)
        key = reference.get("key")
        available = re.search(
            r"Available:\s*(https?://\S+)$",
            extracted[number],
        )
        if available:
            url = available.group(1)
        elif key:
            url = preferred_url(reference, bib_by_key.get(key, {}))
        else:
            url = reference.get("url", "")

        lines = ["    {", f'      "number": {number},']
        if key:
            lines.append(f'      "key": {json.dumps(key, ensure_ascii=False)},')
        lines.append(
            f'      "citation": {json.dumps(extracted[number], ensure_ascii=False)},'
        )
        lines.append(f'      "url": {json.dumps(url, ensure_ascii=False)}')
        lines.append("    }")
        return "\n".join(lines)

    updated, count = reference_pattern.subn(replacement, source)
    if count != len(data["references"]):
        raise ValueError(
            f"Matched {count} reference blocks; expected {len(data['references'])}"
        )
    return updated


def apply_type_overrides(source: str) -> str:
    for key, desired_type in TYPE_OVERRIDES.items():
        pattern = re.compile(
            rf'(?ms)(^    \{{\r?\n      "key": {re.escape(json.dumps(key))},\r?\n'
            rf'      "type": ")(?:[^"\\]|\\.)*(")'
        )
        source, count = pattern.subn(rf"\g<1>{desired_type}\g<2>", source, count=1)
        if count != 1:
            raise ValueError(f"Could not update type for {key}")
    return source


def validate(
    data: dict,
    extracted: dict[int, str],
    expected_citations: dict[int, str],
) -> None:
    if len(extracted) != 919:
        raise ValueError(f"Extracted {len(extracted)} PDF references; expected 919")

    numbers = [entry["number"] for entry in data["references"]]
    if len(numbers) != 1143 or len(set(numbers)) != 1143:
        raise ValueError("Reference numbers must be unique and cover all 1143 records")
    if len(expected_citations) != 1143:
        raise ValueError(
            f"Prepared {len(expected_citations)} citations; expected all 1143 records"
        )

    citations_by_number = {
        entry["number"]: entry["citation"] for entry in data["references"]
    }
    mismatches = [
        number
        for number, citation in expected_citations.items()
        if citations_by_number.get(number) != citation
    ]
    if mismatches:
        raise ValueError(f"Citation text mismatch for records: {mismatches[:20]}")

    malformed_urls = []
    for number, citation in citations_by_number.items():
        available = re.search(r"Available:\s*(.+)$", citation)
        if available and re.search(r"\s", available.group(1)):
            malformed_urls.append(number)
    if malformed_urls:
        raise ValueError(f"Wrapped URLs remain in citations: {malformed_urls}")

    contaminated = [
        number
        for number, citation in citations_by_number.items()
        if "AI 智能体安全调研报告" in citation
    ]
    if contaminated:
        raise ValueError(f"PDF page footer leaked into citations: {contaminated}")

    bib_types = Counter(entry["type"] for entry in data["bib"])
    expected = {"misc": 362, "inproceedings": 116, "article": 29}
    actual = {key: bib_types[key] for key in expected}
    if actual != expected:
        raise ValueError(f"Academic category counts are {actual}; expected {expected}")

    bib_by_key = {entry["key"]: entry for entry in data["bib"]}
    quoted_preprints = [
        entry["number"]
        for entry in data["references"]
        if bib_by_key[entry["key"]]["type"] == "misc"
        and ("“" in entry["citation"] or "”" in entry["citation"])
    ]
    if quoted_preprints:
        raise ValueError(f"Preprint titles still use quotes: {quoted_preprints}")

    reference_598 = next(entry for entry in data["references"] if entry["number"] == 598)
    expected_598 = (
        "K. Gao et al., Imperceptible jailbreaking against large language models, "
        "Oct. 2025. arXiv: 2510.05025 [cs.CL]. [Online]. Available: "
        "https://arxiv.org/abs/2510.05025"
    )
    if reference_598["citation"] != expected_598:
        raise ValueError(f"Reference 598 is still incorrect: {reference_598['citation']}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument(
        "--data",
        type=Path,
        default=Path("src/data/latestReportData_3.ts"),
    )
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    source = args.data.read_text(encoding="utf-8")
    data = load_data(source)
    extracted = extract_pdf_references(args.pdf, data)
    print(f"Extracted {len(extracted)} formatted references from the PDF")
    print(f"PDF reference 598: {extracted.get(598, '<missing>')}")

    if not args.write:
        return

    citations = dict(extracted)
    citations.update(CITATION_OVERRIDES)
    citations.update(build_web_only_citations(data, extracted))
    updated = replace_reference_blocks(source, data, citations)
    updated = apply_type_overrides(updated)
    args.data.write_text(updated, encoding="utf-8", newline="\n")

    updated_data = load_data(updated)
    validate(updated_data, extracted, citations)
    print("Updated reference data and validated category counts")


if __name__ == "__main__":
    main()
