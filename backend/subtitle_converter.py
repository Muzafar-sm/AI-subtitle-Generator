import srt
import webvtt
import ass
from pathlib import Path
from typing import List, Dict, Any
from datetime import timedelta

class SubtitleConverter:
    @staticmethod
    def to_srt(subtitles: List[Dict[str, Any]], output_path: Path) -> str:
        """Convert subtitles to SRT format"""
        srt_subtitles = []
        for i, sub in enumerate(subtitles, start=1):
            srt_sub = srt.Subtitle(
                index=i,
                start=timedelta(seconds=sub["start"]),
                end=timedelta(seconds=sub["end"]),
                content=sub["text"]
            )
            srt_subtitles.append(srt_sub)
        
        srt_content = srt.compose(srt_subtitles)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(srt_content)
        return srt_content

    @staticmethod
    def to_vtt(subtitles: List[Dict[str, Any]], output_path: Path) -> str:
        """Convert subtitles to WebVTT format"""
        vtt = webvtt.WebVTT()
        
        for sub in subtitles:
            caption = webvtt.Caption()
            caption.start = timedelta(seconds=sub["start"])
            caption.end = timedelta(seconds=sub["end"])
            caption.text = sub["text"]
            vtt.captions.append(caption)
        
        vtt.save(str(output_path))
        return vtt.content

    @staticmethod
    def to_ass(subtitles: List[Dict[str, Any]], output_path: Path) -> str:
        """Convert subtitles to ASS format"""
        doc = ass.Document()
        style = ass.Style()
        style.fontname = "Arial"
        style.fontsize = 20
        doc.styles.append(style)

        for sub in subtitles:
            dialogue = ass.Dialogue()
            dialogue.start = timedelta(seconds=sub["start"])
            dialogue.end = timedelta(seconds=sub["end"])
            dialogue.text = sub["text"]
            dialogue.style = style.name
            doc.events.append(dialogue)

        with open(output_path, "w", encoding="utf-8") as f:
            doc.dump_file(f)
        return str(doc)

    @staticmethod
    def convert_format(
        input_format: str,
        output_format: str,
        subtitles: List[Dict[str, Any]],
        output_path: Path
    ) -> str:
        """Convert between different subtitle formats"""
        format_map = {
            "srt": SubtitleConverter.to_srt,
            "vtt": SubtitleConverter.to_vtt,
            "ass": SubtitleConverter.to_ass
        }

        if output_format not in format_map:
            raise ValueError(f"Unsupported output format: {output_format}")

        return format_map[output_format](subtitles, output_path) 