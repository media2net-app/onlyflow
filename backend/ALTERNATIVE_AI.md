# Alternative AI Image Generation Options

Hugging Face heeft hun oude Inference API deprecated. Hier zijn alternatieven:

## Optie 1: Replicate (Aanbevolen voor gratis tier)

Replicate heeft een gratis tier en werkt goed met Stable Diffusion.

1. Maak account op https://replicate.com
2. Ga naar https://replicate.com/account/api-tokens
3. Maak een token aan
4. Voeg toe aan `.env`:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```

## Optie 2: Stability AI (Gratis tier)

Stability AI heeft een gratis API tier.

1. Maak account op https://platform.stability.ai
2. Haal API key op
3. Voeg toe aan `.env`:
   ```
   STABILITY_API_KEY=your_key_here
   ```

## Optie 3: Local Generation (Volledig gratis)

Gebruik Stable Diffusion lokaal met:
- Automatic1111 WebUI
- ComfyUI
- Via Python script

## Voor Nu: Mock Mode

We kunnen een mock mode toevoegen die placeholder images genereert tot we een werkende API hebben.

