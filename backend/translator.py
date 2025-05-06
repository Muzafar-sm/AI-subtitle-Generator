from googletrans import Translator
from typing import List, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor

class SubtitleTranslator:
    def __init__(self):
        self.translator = Translator()
        self.executor = ThreadPoolExecutor(max_workers=4)

    async def translate_subtitles(
        self,
        subtitles: List[Dict[str, Any]],
        target_language: str,
        source_language: str = "auto"
    ) -> List[Dict[str, Any]]:
        """Translate subtitles to target language"""
        translated_subtitles = []
        
        # Process subtitles in batches to avoid rate limiting
        batch_size = 10
        for i in range(0, len(subtitles), batch_size):
            batch = subtitles[i:i + batch_size]
            texts = [sub["text"] for sub in batch]
            
            # Translate batch
            loop = asyncio.get_event_loop()
            translations = await loop.run_in_executor(
                self.executor,
                self._translate_batch,
                texts,
                target_language,
                source_language
            )
            
            # Update subtitles with translations
            for sub, translated_text in zip(batch, translations):
                translated_sub = sub.copy()
                translated_sub["text"] = translated_text
                translated_subtitles.append(translated_sub)
            
            # Add small delay between batches
            await asyncio.sleep(0.5)
        
        return translated_subtitles

    def _translate_batch(
        self,
        texts: List[str],
        target_language: str,
        source_language: str
    ) -> List[str]:
        """Translate a batch of texts"""
        try:
            translations = self.translator.translate(
                texts,
                dest=target_language,
                src=source_language
            )
            return [t.text for t in translations]
        except Exception as e:
            print(f"Translation error: {str(e)}")
            return texts  # Return original texts if translation fails 