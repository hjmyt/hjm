#!/usr/bin/env python3
"""Build static true-score challenge data from single-part or full-score MusicXML."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from xml.etree import ElementTree as ET


def pitch_name(note: ET.Element) -> str | None:
    pitch = note.find("pitch")
    if pitch is None:
        return None
    step = pitch.findtext("step", "C")
    alter = int(pitch.findtext("alter", "0"))
    accidental = "#" * max(0, alter) + "b" * max(0, -alter)
    return f"{step}{accidental}{pitch.findtext('octave', '4')}"


def song_metadata(source: Path) -> tuple[str, str]:
    source_hint = f"{source.parent.name}/{source.stem}".lower()
    if "听海" in source_hint or "ting-hai" in source_hint:
        return "ting-hai", "《听海》"
    if "蒲公英的约定" in source_hint or "dandelion-promise" in source_hint:
        return "dandelion-promise", "《蒲公英的约定》"
    if "千与千寻" in source_hint or "spirited-away" in source_hint:
        return "spirited-away", "《千与千寻》"
    if "周杰伦婚礼" in source_hint or "jay-wedding" in source_hint:
        return "jay-wedding-song", "《周杰伦婚礼曲》"
    if "第二圆舞曲" in source_hint or "second-waltz" in source_hint:
        return "second-waltz", "《第二圆舞曲》"
    if "再唱送别" in source_hint or "zai-chang-song-bie" in source_hint:
        return "zai-chang-song-bie", "《再唱送别》"
    if "热烈" in source_hint or "relie" in source_hint:
        return "relie", "《热烈》"
    raise ValueError(f"Unsupported song source {source}; add an explicit song metadata mapping")


def part_metadata(part_name: str, source: Path) -> tuple[str, str, str]:
    normalized = f"{part_name} {source.stem}".strip().lower()
    if "alto saxophone" in normalized or "alto sax" in normalized or "中音萨克斯" in normalized:
        return "alto-saxophone", "中音萨克斯", "alto-saxophone"
    if "竹笛" in normalized or "笛子" in normalized or "bamboo-flute" in normalized:
        return "bamboo-flute", "竹笛", "bamboo-flute"
    if "recorder" in normalized or "竖笛" in normalized:
        return "recorder", "竖笛", "recorder"
    if "oboe" in normalized or "双簧管" in normalized:
        return "oboe", "双簧管", "oboe"
    if "长笛" in part_name or "flute" in normalized:
        return "flute", "长笛", "flute"
    if "viola" in normalized or "中提琴" in normalized:
        return "viola", "中提琴", "viola"
    if "第三小提琴" in normalized or "violin iii" in normalized:
        return "violin-3", "小提琴 III", "violin"
    if "第二小提琴" in normalized or "violin ii" in normalized or "小提琴 ii" in normalized or "小提琴2" in normalized:
        return "violin-2", "小提琴 II", "violin"
    if "小提琴" in part_name or "violin" in normalized:
        return "violin-1", "小提琴 I", "violin"
    if "violoncello" in normalized or "cello" in normalized or "大提琴" in normalized:
        return "cello", "大提琴", "cello"
    if "contrabass" in normalized or "double bass" in normalized or "低音提琴" in normalized:
        return "contrabass", "低音提琴", "contrabass"
    if "piano" in normalized or "钢琴" in normalized:
        return "piano", "钢琴", "piano"
    raise ValueError(f"Unsupported part name {part_name!r} in {source}; add an explicit metadata mapping")


def read_scores(source: Path, hidden: bool = False) -> list[dict]:
    raw = source.read_bytes()
    root = ET.fromstring(raw)
    parts = root.findall("part")
    if not parts:
        raise ValueError("MusicXML contains no part")
    song_id, song_title = song_metadata(source)
    score_parts = {item.get("id"): item for item in root.findall("part-list/score-part")}
    global_tempo = next((float(sound.get("tempo")) for sound in root.findall(".//sound") if sound.get("tempo")), 120.0)
    scores = []
    for part in parts:
        score_part = score_parts.get(part.get("id"))
        part_name = score_part.findtext("part-name", "") if score_part is not None else ""
        part_id, part_label, instrument = part_metadata(part_name, source)
        if instrument == "piano":
            continue
        scores.append(read_part(source, raw, part, song_id, song_title, part_id, part_label, instrument, global_tempo, hidden))
    return scores


def read_part(source: Path, raw: bytes, part: ET.Element, song_id: str, song_title: str, part_id: str, part_label: str, instrument: str, global_tempo: float, hidden: bool) -> dict:
    divisions = 1
    beats, beat_type, tempo, fifths, transpose_semitones = 4, 4, global_tempo, 0, 0
    clef = "treble"
    score_beats, score_beat_type = None, None
    measures = []
    for xml_measure in part.findall("measure"):
        attributes = xml_measure.find("attributes")
        if attributes is not None:
            divisions = int(attributes.findtext("divisions", str(divisions)))
            time = attributes.find("time")
            if time is not None:
                beats = int(time.findtext("beats", str(beats)))
                beat_type = int(time.findtext("beat-type", str(beat_type)))
                if score_beats is None:
                    score_beats, score_beat_type = beats, beat_type
            key = attributes.find("key")
            if key is not None:
                fifths = int(key.findtext("fifths", str(fifths)))
            transpose = attributes.find("transpose")
            if transpose is not None:
                transpose_semitones = int(transpose.findtext("chromatic", "0")) + 12 * int(transpose.findtext("octave-change", "0"))
            clef_element = attributes.find("clef")
            if clef_element is not None:
                clef_sign = clef_element.findtext("sign")
                clef = "bass" if clef_sign == "F" else "alto" if clef_sign == "C" else "treble"
        for sound in xml_measure.findall(".//sound"):
            if sound.get("tempo"):
                tempo = float(sound.get("tempo"))

        cursor = 0
        last_start = 0
        items = []
        for child in xml_measure:
            if child.tag == "backup":
                cursor -= int(child.findtext("duration", "0"))
                continue
            if child.tag == "forward":
                cursor += int(child.findtext("duration", "0"))
                continue
            if child.tag != "note" or child.find("grace") is not None:
                continue
            duration_raw = int(child.findtext("duration", "0"))
            chord = child.find("chord") is not None
            at_raw = last_start if chord else cursor
            if not chord:
                last_start = cursor
                cursor += duration_raw
            ties = {tie.get("type") for tie in child.findall("tie")}
            tie = "stop-start" if {"stop", "start"}.issubset(ties) else "start" if "start" in ties else "stop" if "stop" in ties else ""
            item = {
                "at": at_raw / divisions,
                "duration": duration_raw / divisions,
            }
            pitch = pitch_name(child)
            if pitch is None:
                item["rest"] = True
                if child.find("rest") is not None and child.find("rest").get("measure") == "yes":
                    item["measureRest"] = True
            else:
                item["pitch"] = pitch
            if tie:
                item["tie"] = tie
            if child.findall("dot"):
                item["dots"] = len(child.findall("dot"))
            beams = {beam.get("number", "1"): (beam.text or "").strip() for beam in child.findall("beam")}
            if beams.get("1"):
                item["beam"] = beams["1"]
            if beams.get("2"):
                item["beam2"] = beams["2"]
            items.append(item)

        measure_beats = beats * 4 / beat_type
        if cursor != round(measure_beats * divisions):
            raise ValueError(f"Measure {xml_measure.get('number')} has {cursor / divisions} beats, expected {measure_beats}")
        measures.append({"number": int(xml_measure.get("number", len(measures) + 1)), "beats": measure_beats, "items": items})

    if not measures:
        raise ValueError("MusicXML contains no measures")
    score_beats = score_beats or beats
    score_beat_type = score_beat_type or beat_type
    result = {
        "id": f"{song_id}-{part_id}-full-v1",
        "songId": song_id,
        "songTitle": song_title,
        "partId": part_id,
        "title": song_title,
        "part": part_label,
        "instrument": instrument,
        "sourceMeasures": f"全谱 · {len(measures)} 小节",
        "meter": f"{score_beats}/{score_beat_type}",
        "tempo": tempo,
        "keyFifths": fifths,
        "clef": clef,
        "transposeSemitones": transpose_semitones,
        "sourceSha256": hashlib.sha256(raw).hexdigest(),
        "measures": measures,
        "modes": {
            "simple": {"label": "简单", "preview": True, "description": "可先听全谱示范，再完成整首击打", "tolerance": 0.13, "measureAccuracy": 0.7, "sectionAccuracy": 0.7},
            "medium": {"label": "中级", "preview": False, "description": "没有示范，直接按全谱独立击打", "tolerance": 0.105, "measureAccuracy": 0.8, "sectionAccuracy": 0.8},
            "hard": {"label": "困难", "preview": False, "description": "完整击打全谱，按严格窗口判定", "tolerance": 0.075, "measureAccuracy": 0.9, "sectionAccuracy": 0.9},
        },
    }
    if hidden:
        result["hidden"] = True
    return result


def write_js(scores: list[dict], output: Path) -> None:
    payload = json.dumps(scores, ensure_ascii=False, separators=(",", ":"))
    text = (
        "'use strict';\n\n"
        "// Generated by scripts/build-score-audition.py from local MusicXML sources.\n"
        "// The licensed/private source is intentionally excluded from version control.\n"
        f"const SCORE_AUDITION_DATA=(()=>{{const scores={payload};"
        "for(const score of scores){for(const measure of score.measures){for(const item of measure.items)Object.freeze(item);Object.freeze(measure.items);Object.freeze(measure);}"
        "Object.freeze(score.measures);for(const mode of Object.values(score.modes))Object.freeze(mode);Object.freeze(score.modes);Object.freeze(score);}"
        "Object.freeze(scores);return Object.freeze({scores,score:scores[0]});})();\n"
    )
    output.write_text(text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--add-source", action="append", type=Path, default=[])
    parser.add_argument("--hidden-source", action="append", type=Path, default=[])
    parser.add_argument("--existing-data", type=Path, help="Preserve other generated scores; add or replace the supplied score IDs")
    args = parser.parse_args()
    existing = []
    if args.existing_data:
        text = args.existing_data.read_text(encoding="utf-8")
        existing, _ = json.JSONDecoder().raw_decode(text.split("const scores=", 1)[1])
    scores = []
    for path in [args.source, *args.add_source]:
        scores.extend(read_scores(path))
    for path in args.hidden_source:
        scores.extend(read_scores(path, hidden=True))
    if len({score["id"] for score in scores}) != len(scores):
        raise ValueError("Score IDs must be unique")
    incoming = {score["id"]: score for score in scores}
    merged = [incoming.pop(score["id"], score) for score in existing]
    merged.extend(incoming.values())
    scores = merged
    write_js(scores, args.output)
    print(f"Wrote {len(scores)} score parts / {sum(len(score['measures']) for score in scores)} measures to {args.output}")


if __name__ == "__main__":
    main()
