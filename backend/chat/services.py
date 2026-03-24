from django.conf import settings
from google import genai
from google.genai import types

class AIEngine:
    def __init__(self):
        self.gemini_model_name = 'gemini-2.5-flash'
        self.model_key_map = {
            'gemini': getattr(settings, 'GEMINI_API_KEY', ''),
            'claude': getattr(settings, 'CLAUDE_API_KEY', '')
        }

    def _get_client(self, model_type):
        """Get a Gemini client for the specific model type"""
        key = self.model_key_map.get(model_type, self.model_key_map['gemini'])
        if not key:
            # Fallback to any available key if specific one is missing
            for k in self.model_key_map.values():
                if k:
                    key = k
                    break
        
        return genai.Client(api_key=key) if key else None

    def get_streaming_response(self, user_message, history=None, context=None, model="gemini-2.5-flash", attachments=None):
        """Main entry point for streaming responses with model routing"""
        client = self._get_client(model)
        
        try:
            if not client:
                raise Exception(f"API key for {model} not configured.")
            
            yield from self._get_gemini_response(client, user_message, history, context, attachments)
        except Exception as e:
            error_str = str(e).upper()
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                model_name = model.upper()
                yield f"\n\n⚠️ {model_name} is currently unavailable. Try switching to other models! \n"
            else:
                yield f"\n\n**[Error]** {str(e)}\n"

    def _get_gemini_response(self, client, user_message, history=None, context=None, attachments=None):
        contents = []
        if history:
            for h in history:
                role = "user" if h["role"] == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=h["content"])]))
    
        user_parts = []

        if attachments:
            for attachment in attachments:
                try:
                    mime_type = attachment.file_type or 'application/octet-stream'
                    if mime_type.startswith('image/'):
                        with open(attachment.file.path, 'rb') as f:
                            image_bytes = f.read()
                        user_parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
                    elif attachment.extracted_text:
                        user_parts.append(types.Part.from_text(
                        text=f"[File: {attachment.file.name}]\n{attachment.extracted_text}"
                    ))
                except Exception as e:
                    print(f"Error processing attachment: {e}")

        if context:
            user_parts.append(types.Part.from_text(text=f"Context from uploaded files:\n{context}\n\nUser Question: {user_message}"))
        else:
            user_parts.append(types.Part.from_text(text=user_message))

        contents.append(types.Content(role="user", parts=user_parts))

        response = client.models.generate_content_stream(
            model=self.gemini_model_name,
            contents=contents,
            config=types.GenerateContentConfig(temperature=0.7)
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text

    def generate_title(self, user_message, assistant_response=None, model="gemini"):
        """Generate a concise title from user + assistant text.

        Returns a short, human-friendly string intended for chat sidebar display.
        """
        user_words = user_message.split()
        fallback = " ".join(user_words[:5]) + ("..." if len(user_words) > 5 else "")

        # If we can't generate with the model, at least keep things stable.
        assistant_response = assistant_response or ""
        if not user_message.strip():
            return fallback

        client = self._get_client(model)
        if not client:
            return fallback

        # Prevent very large prompts from title generation.
        user_message_for_prompt = user_message[:2000]
        assistant_response_for_prompt = assistant_response[:6000]

        prompt = (
            "Create a concise chat title that summarizes the conversation.\n"
            "Rules:\n"
            "- Maximum 8 words.\n"
            "- Return only the title text (no quotes, no punctuation like leading ':'), and no extra commentary.\n"
            "- Avoid generic titles like \"New Chat\".\n\n"
            f"User message:\n{user_message_for_prompt}\n\n"
            f"Assistant response:\n{assistant_response_for_prompt}\n"
        )

        try:
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)]
                )
            ]

            # Use streaming because it is already integrated in this codebase.
            response = client.models.generate_content_stream(
                model=self.gemini_model_name,
                contents=contents,
                config=types.GenerateContentConfig(temperature=0.2)
            )

            title_text = ""
            for chunk in response:
                if getattr(chunk, "text", None):
                    title_text += chunk.text

            title_text = title_text.strip()
            if not title_text:
                return fallback

            # Normalize output: use first line and strip common wrappers.
            import re
            title_text = title_text.splitlines()[0].strip()
            title_text = title_text.strip("\"' \t\r\n")
            title_text = re.sub(r'^(title|chat title|name)\\s*:\\s*', '', title_text, flags=re.IGNORECASE)

            words = title_text.split()
            if not words:
                return fallback
            if len(words) > 8:
                title_text = " ".join(words[:8])

            return title_text
        except Exception:
            return fallback
