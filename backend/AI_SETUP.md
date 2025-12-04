# AI Setup Guide - Hugging Face

Om AI image generation te gebruiken, moet je een gratis Hugging Face API key aanmaken.

## Stap 1: Hugging Face Account

1. Ga naar https://huggingface.co/
2. Maak een gratis account aan
3. Log in

## Stap 2: API Token Aanmaken

1. Ga naar https://huggingface.co/settings/tokens
2. Klik op "New token"
3. Geef het een naam (bijv. "OnlyFlow")
4. Selecteer "Read" permissions
5. Klik "Generate token"
6. **Kopieer de token** (je ziet hem maar 1x!)

## Stap 3: API Key Toevoegen

1. Open `backend/.env` bestand
2. Voeg toe:
```
HUGGINGFACE_API_KEY=your_token_here
```

3. Vervang `your_token_here` met je gekopieerde token

## Stap 4: Backend Herstarten

```bash
cd backend
npm run dev
```

## Gebruik

1. Ga naar `/influencers/train` in de frontend
2. Vul de basis informatie in (Name, Gender, Age, etc.)
3. Klik op "Generate with AI" button bij Step 2
4. Wacht tot de images worden gegenereerd (kan 1-2 minuten duren)

## Gratis Tier Limieten

- Hugging Face gratis tier heeft rate limits
- ~1000 requests per dag
- Images worden met 2 seconden delay gegenereerd om rate limits te vermijden
- Training images (25 stuks) kunnen 1-2 minuten duren

## Troubleshooting

**Error: "HUGGINGFACE_API_KEY is not set"**
- Controleer of de `.env` file bestaat in de `backend/` folder
- Controleer of de key correct is gezet

**Error: "401 Unauthorized"**
- Controleer of je API token correct is
- Maak een nieuwe token aan als nodig

**Images worden niet gegenereerd**
- Check de backend console voor errors
- Wacht even, generation kan lang duren
- Controleer je Hugging Face account voor rate limits

