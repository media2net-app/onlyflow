import Sidebar from './Sidebar'
import Header from './Header'
import { 
  HiOutlineLightBulb,
  HiOutlineCog,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineSparkles,
  HiOutlinePhotograph,
  HiOutlineUser
} from 'react-icons/hi'

function MinimaxKnowledge() {
  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/30">
              <h1 className="text-4xl font-bold text-white mb-3">Minimax AI Knowledge Base</h1>
              <p className="text-lg text-gray-300">
                Complete gids voor het optimaal gebruiken van Minimax image-01 model voor AI image generatie
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Kennisbank voor het configureren en optimaliseren van AI image generatie in OnlyFlow
              </p>
            </div>

            {/* Model Overview */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineSparkles className="w-6 h-6 text-purple-400" />
                <span>Model: Minimax image-01</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-white">Minimax image-01</strong> is een geavanceerd AI image generation model 
                  dat we gebruiken via Replicate API. Dit model is speciaal gekozen omdat het:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start space-x-2">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Character consistency ondersteunt</strong> - Kritisch voor het behouden van hetzelfde gezicht/karakter over meerdere afbeeldingen</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Kosteneffectief</strong> - Goedkoper dan alternatieven</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Hoge kwaliteit</strong> - Realistische, professionele resultaten</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Flexibele aspect ratios</strong> - Ondersteunt verschillende formaten (1:1, 2:3, 16:9, etc.)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Parameters */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineCog className="w-6 h-6 text-blue-400" />
                <span>Parameters & Instellingen</span>
              </h2>
              
              <div className="space-y-6">
                {/* Prompt Parameter */}
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-3">1. Prompt (Verplicht)</h3>
                  <p className="text-gray-300 mb-3">
                    De prompt beschrijft wat je wilt genereren. Dit is de belangrijkste parameter.
                  </p>
                  <div className="bg-dark-surface rounded p-3 mb-3">
                    <code className="text-sm text-purple-300">
                      prompt: "portrait photo of female, 24 years old, long brown hair, in luxury hotel, professional photography, high quality, detailed, 8k, realistic, natural lighting"
                    </code>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong className="text-white">Best Practices:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• Wees specifiek over het karakter (gender, age, hair color)</li>
                      <li>• Beschrijf de setting/locatie duidelijk</li>
                      <li>• Voeg kwaliteitsindicatoren toe: "professional photography", "high quality", "8k", "realistic"</li>
                      <li>• Gebruik consistente terminologie voor hetzelfde karakter</li>
                      <li>• Voeg "natural lighting" toe voor realistische resultaten</li>
                    </ul>
                  </div>
                </div>

                {/* Character Image Parameter */}
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-3">2. Character Image (Aanbevolen)</h3>
                  <div className="flex items-start space-x-2 mb-3">
                    <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300">
                      <strong className="text-yellow-400">KRITIEK:</strong> Dit is de belangrijkste parameter voor character consistency!
                    </p>
                  </div>
                  <div className="bg-dark-surface rounded p-3 mb-3">
                    <code className="text-sm text-purple-300">
                      character_image: "http://localhost:3001/storage/profile_123.png"
                    </code>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong className="text-white">Hoe het werkt:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• Upload een referentie foto van het karakter (bijv. profiel foto)</li>
                      <li>• Minimax gebruikt deze foto om het gezicht consistent te houden</li>
                      <li>• Zonder character_image kan het gezicht variëren tussen generaties</li>
                      <li>• Gebruik altijd de profiel foto als character reference</li>
                    </ul>
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <p className="text-yellow-300 text-sm">
                        <strong>⚠️ Waarschuwing:</strong> Zonder character_image parameter zal het gezicht NIET consistent zijn tussen verschillende generaties. 
                        Dit is cruciaal voor influencer training!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-3">3. Aspect Ratio</h3>
                  <div className="bg-dark-surface rounded p-3 mb-3">
                    <code className="text-sm text-purple-300">
                      aspect_ratio: "1:1" | "2:3" | "3:2" | "16:9" | "9:16"
                    </code>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong className="text-white">Ondersteunde formaten:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong className="text-white">1:1</strong> - Vierkant (Instagram feed, profiel foto)</li>
                      <li>• <strong className="text-white">2:3</strong> - Portret (Instagram story, feed post)</li>
                      <li>• <strong className="text-white">3:2</strong> - Landscape</li>
                      <li>• <strong className="text-white">16:9</strong> - Widescreen (video thumbnails)</li>
                      <li>• <strong className="text-white">9:16</strong> - Verticaal (Stories, Reels)</li>
                    </ul>
                  </div>
                </div>

                {/* Number of Images */}
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-3">4. Number of Images</h3>
                  <div className="bg-dark-surface rounded p-3 mb-3">
                    <code className="text-sm text-purple-300">
                      number_of_images: 1 (default)
                    </code>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="text-gray-300">
                      Aantal afbeeldingen dat in één API call wordt gegenereerd. Voor training images genereren we meestal 
                      meerdere calls van 1 image voor betere controle en tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineLightBulb className="w-6 h-6 text-yellow-400" />
                <span>Best Practices & Tips</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">✓ Character Consistency</h3>
                  <p className="text-sm text-gray-300">
                    Gebruik ALTIJD de character_image parameter met de profiel foto. Dit is de enige manier om 
                    consistentie te garanderen tussen verschillende generaties.
                  </p>
                </div>
                
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">✓ Prompt Structuur</h3>
                  <p className="text-sm text-gray-300">
                    Structuur: "portrait photo of [gender], [age] years old, [hair color], [location], [activity], 
                    professional photography, high quality, detailed, 8k, realistic, natural lighting"
                  </p>
                </div>
                
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">✓ Kwaliteitsindicatoren</h3>
                  <p className="text-sm text-gray-300">
                    Voeg altijd toe: "professional photography", "high quality", "detailed", "8k", "realistic", 
                    "natural lighting" voor beste resultaten.
                  </p>
                </div>
                
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">✓ Variatie in Prompts</h3>
                  <p className="text-sm text-gray-300">
                    Voor training images: varieer outfit, setting en pose, maar behoud hetzelfde karakter door 
                    character_image te gebruiken.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Implementation */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineDocumentText className="w-6 h-6 text-green-400" />
                <span>Huidige Implementatie in OnlyFlow</span>
              </h2>
              
              <div className="space-y-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Profile Image Generation</h3>
                  <div className="bg-dark-surface rounded p-3 mb-3">
                    <code className="text-sm text-purple-300">
                      prompt: "professional headshot portrait of {gender}, {age} years old{hairColor}, {location}, high quality photography, studio lighting, professional, 8k, realistic, detailed"
                    </code>
                  </div>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Parameters:</strong> aspect_ratio: "1:1", number_of_images: 1<br/>
                    <strong className="text-white">Character Image:</strong> Niet gebruikt (eerste generatie)
                  </p>
                </div>

                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Training Images Generation</h3>
                  <div className="bg-dark-surface rounded p-3 mb-3">
                    <code className="text-sm text-purple-300">
                      prompt: "portrait photo of {gender}, {age} years old, {hairColor}, wearing {outfit}, in {setting}, {pose}, professional photography, high quality, detailed, 8k, realistic, natural lighting, sexy, alluring, tasteful"
                    </code>
                  </div>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Parameters:</strong> aspect_ratio: "1:1", number_of_images: 1<br/>
                    <strong className="text-white">Character Image:</strong> ✅ Gebruikt (profiel foto als referentie voor consistentie)
                  </p>
                </div>

                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Content Generation</h3>
                  <div className="bg-dark-surface rounded p-3 mb-3">
                    <code className="text-sm text-purple-300">
                      prompt: "portrait photo of {gender}, {age} years old, {hairColor}, {activity}, wearing {outfit}, at {location}, professional photography, high quality, detailed, 8k, realistic, natural lighting"
                    </code>
                  </div>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Parameters:</strong> aspect_ratio: variabel (2:3, 16:9, etc.), number_of_images: 1<br/>
                    <strong className="text-white">Character Image:</strong> ✅ Gebruikt (profiel foto als referentie)
                  </p>
                </div>
              </div>
            </div>

            {/* Common Issues & Solutions */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineExclamationCircle className="w-6 h-6 text-orange-400" />
                <span>Veelvoorkomende Problemen & Oplossingen</span>
              </h2>
              
              <div className="space-y-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Probleem: Verschillende gezichten per generatie</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-white">Oorzaak:</strong> Character_image parameter wordt niet gebruikt
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Oplossing:</strong> Zorg dat de profiel foto wordt doorgegeven als character_image parameter. 
                    Dit is de enige manier om gezichtsconsistentie te garanderen.
                  </p>
                </div>

                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Probleem: Lage kwaliteit resultaten</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-white">Oorzaak:</strong> Prompt mist kwaliteitsindicatoren
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Oplossing:</strong> Voeg altijd toe: "professional photography", "high quality", 
                    "detailed", "8k", "realistic", "natural lighting" aan je prompt.
                  </p>
                </div>

                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Probleem: Karakter ziet er anders uit dan bedoeld</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-white">Oorzaak:</strong> Prompt beschrijft karakterkenmerken die conflicteren met character_image
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Oplossing:</strong> Focus in de prompt op activiteit, outfit en setting, niet op 
                    fysieke kenmerken. De character_image bepaalt het uiterlijk.
                  </p>
                </div>

                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Probleem: Credits opgebruikt</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-white">Oorzaak:</strong> Replicate API vereist credits voor Minimax model
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Oplossing:</strong> Zorg dat REPLICATE_API_TOKEN is ingesteld en er voldoende 
                    credits zijn. Bij onvoldoende credits valt het systeem terug op mock mode.
                  </p>
                </div>
              </div>
            </div>

            {/* Optimization Tips */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Optimalisatie Tips</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">1. Prompt Engineering</h3>
                  <p className="text-sm text-gray-300">
                    Test verschillende prompt structuren. Soms werkt "portrait photo of..." beter dan "photo of a...". 
                    Experimenteer met de volgorde van beschrijvingen.
                  </p>
                </div>
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">2. Character Reference</h3>
                  <p className="text-sm text-gray-300">
                    Gebruik altijd de beste kwaliteit profiel foto als character_image. Een duidelijke, goed belichte 
                    foto geeft betere consistentie.
                  </p>
                </div>
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">3. Batch Generation</h3>
                  <p className="text-sm text-gray-300">
                    Voor training images: genereer één voor één in plaats van batches. Dit geeft betere controle en 
                    tracking van individuele resultaten.
                  </p>
                </div>
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">4. Testing & Iteration</h3>
                  <p className="text-sm text-gray-300">
                    Gebruik de Prompt Testing pagina om verschillende prompts te testen voordat je bulk generatie start. 
                    Dit bespaart tijd en credits.
                  </p>
                </div>
              </div>
            </div>

            {/* API Reference */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4">API Referentie</h2>
              <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                <h3 className="text-lg font-semibold text-white mb-3">Minimax image-01 via Replicate</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Model ID:</p>
                    <code className="text-sm text-purple-300 bg-dark-surface px-2 py-1 rounded">minimax/image-01</code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Required Parameters:</p>
                    <code className="text-sm text-purple-300 bg-dark-surface px-2 py-1 rounded block">
                      prompt (string) - Beschrijving van de gewenste afbeelding
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Optional Parameters:</p>
                    <div className="space-y-1">
                      <code className="text-sm text-purple-300 bg-dark-surface px-2 py-1 rounded block">
                        character_image (string) - URL naar referentie foto voor consistentie
                      </code>
                      <code className="text-sm text-purple-300 bg-dark-surface px-2 py-1 rounded block">
                        aspect_ratio (string) - "1:1" | "2:3" | "3:2" | "16:9" | "9:16"
                      </code>
                      <code className="text-sm text-purple-300 bg-dark-surface px-2 py-1 rounded block">
                        number_of_images (number) - Aantal afbeeldingen (default: 1)
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MinimaxKnowledge

