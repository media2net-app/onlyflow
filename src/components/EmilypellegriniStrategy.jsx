import Sidebar from './Sidebar'
import Header from './Header'
import { 
  HiOutlineTrendingUp,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlinePhotograph,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlineChartBar
} from 'react-icons/hi'

function EmilypellegriniStrategy() {
  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-purple-500/30">
              <h1 className="text-4xl font-bold text-white mb-3">Emily Pellegrini Strategy</h1>
              <p className="text-lg text-gray-300">
                De complete gids voor het creëren van een succesvolle AI-influencer zoals Emily Pellegrini
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Van $0 naar $18.000+ per maand met een volledig AI-gegenereerde influencer
              </p>
            </div>

            {/* Success Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <HiOutlineUser className="w-6 h-6 text-purple-400" />
                  <h3 className="text-sm font-medium text-gray-400">Instagram Volgers</h3>
                </div>
                <p className="text-3xl font-bold text-white">250,000+</p>
              </div>
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <HiOutlineCurrencyDollar className="w-6 h-6 text-green-400" />
                  <h3 className="text-sm font-medium text-gray-400">Maandelijks Inkomen</h3>
                </div>
                <p className="text-3xl font-bold text-white">$18,000+</p>
              </div>
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <HiOutlineTrendingUp className="w-6 h-6 text-blue-400" />
                  <h3 className="text-sm font-medium text-gray-400">Fanvue Abonnees</h3>
                </div>
                <p className="text-3xl font-bold text-white">4,000+</p>
              </div>
              <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <HiOutlineChartBar className="w-6 h-6 text-orange-400" />
                  <h3 className="text-sm font-medium text-gray-400">Abonnement Prijs</h3>
                </div>
                <p className="text-3xl font-bold text-white">$4.50</p>
              </div>
            </div>

            {/* The Story */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineLightBulb className="w-6 h-6 text-yellow-400" />
                <span>Het Verhaal van Emily Pellegrini</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Emily Pellegrini is een volledig AI-gegenereerd virtueel model dat in korte tijd een enorme 
                  volgersbasis heeft opgebouwd. Haar anonieme creator gebruikte AI-tools om een model te creëren 
                  dat voldoet aan de 'droomvrouw' van de gemiddelde man, met kenmerken zoals lang bruin haar en 
                  lange benen.
                </p>
                <p>
                  <strong className="text-white">Het opmerkelijke:</strong> Emily is zo realistisch dat bekende 
                  personen (voetballers, MMA-vechters, miljardairs) haar uitnodigen voor etentjes en reizen, 
                  zich niet bewust van haar virtuele aard.
                </p>
                <p>
                  <strong className="text-white">De inspanning:</strong> Haar maker werkte aanvankelijk 14-16 
                  uur per dag om haar uiterlijk en bewegingen te perfectioneren. Het doel was om haar zo realistisch 
                  en aantrekkelijk mogelijk te maken.
                </p>
              </div>
            </div>

            {/* Content Strategy */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlinePhotograph className="w-6 h-6 text-purple-400" />
                <span>Content Strategie</span>
              </h2>
              <div className="space-y-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">1. Dagelijks Leven Content</h3>
                  <p className="text-gray-300 mb-3">
                    Emily deelt foto's en video's die haar 'dagelijks leven' weergeven, waardoor ze authentiek 
                    en relateerbaar overkomt:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Reizen:</strong> Exotische locaties, hotels, stranden</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Sportsessies:</strong> Gym workouts, yoga, fitness</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Sociale Activiteiten:</strong> Etentjes, uitgaan, vrienden</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Lifestyle:</strong> Fashion, beauty, dagelijkse routines</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">2. Consistentie & Realisme</h3>
                  <p className="text-gray-300">
                    De sleutel tot Emily's succes is de <strong className="text-white">extreme consistentie</strong> in 
                    haar uiterlijk. Elke foto moet dezelfde persoon tonen - geen variaties in gezicht, lichaam of stijl. 
                    Dit vereist geavanceerde AI-tools en veel aandacht voor detail.
                  </p>
                </div>
              </div>
            </div>

            {/* Monetization Strategy */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineCurrencyDollar className="w-6 h-6 text-green-400" />
                <span>Monetisering Strategie</span>
              </h2>
              <div className="space-y-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">1. Instagram als Funnel</h3>
                  <p className="text-gray-300 mb-3">
                    Instagram fungeert als de primaire funnel om volgers te verzamelen en interesse te wekken. 
                    Gratis content trekt volgers aan die later kunnen worden geconverteerd naar betalende klanten.
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Post dagelijks consistente content</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Gebruik relevante hashtags voor bereik</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Link naar exclusieve content in bio</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">2. Fanvue (OnlyFans-alternatief)</h3>
                  <p className="text-gray-300 mb-3">
                    <strong className="text-white">Pricing:</strong> $4.50 per maand<br/>
                    <strong className="text-white">Abonnees:</strong> 4,000+<br/>
                    <strong className="text-white">Maandelijks Inkomen:</strong> $18,000+
                  </p>
                  <p className="text-gray-300">
                    Fanvue biedt een platform voor exclusieve content die niet op Instagram wordt gedeeld. 
                    Dit kan variëren van meer intieme foto's tot exclusieve video's en persoonlijke berichten.
                  </p>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">3. Conversion Rate</h3>
                  <p className="text-gray-300">
                    Met 250,000+ Instagram volgers en 4,000+ Fanvue abonnees heeft Emily een conversion rate 
                    van ongeveer <strong className="text-white">1.6%</strong>. Dit is een uitstekende conversie 
                    voor een AI-influencer en toont aan dat de strategie werkt.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Approach */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <HiOutlineSparkles className="w-6 h-6 text-blue-400" />
                <span>Technische Aanpak</span>
              </h2>
              <div className="space-y-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">1. AI Character Design</h3>
                  <p className="text-gray-300 mb-3">
                    Emily werd ontworpen op basis van AI-analyse van wat als aantrekkelijk wordt beschouwd:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Kenmerken:</strong> Lang bruin haar, lange benen</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Realisme:</strong> Extreem realistisch, moeilijk te onderscheiden van echt</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Consistentie:</strong> Zelfde uiterlijk in elke afbeelding</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">2. Tijd & Inspanning</h3>
                  <p className="text-gray-300">
                    <strong className="text-white">Initiële Investering:</strong> 14-16 uur per dag om uiterlijk en 
                    bewegingen te perfectioneren. Dit toont aan dat succesvolle AI-influencers niet 'overnight' worden 
                    gemaakt - er is serieuze tijd en expertise voor nodig.
                  </p>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="text-lg font-semibold text-white mb-2">3. OnlyFlow Platform</h3>
                  <p className="text-gray-300">
                    Met OnlyFlow kun je dit proces drastisch versnellen. Ons platform biedt:
                  </p>
                  <ul className="space-y-2 text-gray-300 mt-3">
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Geautomatiseerde training image generatie</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Consistente character generation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Dagelijkse content planning</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Bulk content generatie</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Stappenplan: Jouw AI-Influencer Creëren</h2>
              <div className="space-y-4">
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Stap 1: Character Design</h3>
                  <p className="text-gray-300">
                    Gebruik OnlyFlow om je influencer te trainen met 20+ training images. Zorg voor consistentie 
                    in uiterlijk, stijl en karakter.
                  </p>
                </div>
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Stap 2: Content Strategie</h3>
                  <p className="text-gray-300">
                    Plan dagelijkse content met OnlyFlow's Content Plan feature. Focus op lifestyle, reizen, 
                    fitness en sociale activiteiten.
                  </p>
                </div>
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Stap 3: Instagram Opbouw</h3>
                  <p className="text-gray-300">
                    Post dagelijks consistente content. Gebruik relevante hashtags en engage met je publiek. 
                    Bouw langzaam je volgersbasis op.
                  </p>
                </div>
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Stap 4: Monetisering</h3>
                  <p className="text-gray-300">
                    Zodra je 10,000+ volgers hebt, start met Fanvue of OnlyFans. Bied exclusieve content aan 
                    voor $3-5 per maand. Scale up naarmate je groeit.
                  </p>
                </div>
                <div className="bg-dark-surface/50 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Stap 5: Automatisering</h3>
                  <p className="text-gray-300">
                    Gebruik OnlyFlow's automatische content generatie om dagelijks meerdere posts te maken 
                    zonder handmatige inspanning. Focus op strategie en groei.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-dark-surface rounded-lg p-6 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4">Belangrijkste Lessen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="font-semibold text-white mb-2">✓ Realisme is Cruciaal</h3>
                  <p className="text-sm text-gray-300">
                    Investeer tijd in het creëren van een extreem realistisch karakter. Dit is wat Emily 
                    onderscheidt van andere AI-influencers.
                  </p>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="font-semibold text-white mb-2">✓ Consistentie is Koning</h3>
                  <p className="text-sm text-gray-300">
                    Elke foto moet dezelfde persoon tonen. Variaties in uiterlijk breken de illusie en 
                    verminderen authenticiteit.
                  </p>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="font-semibold text-white mb-2">✓ Content Diversiteit</h3>
                  <p className="text-sm text-gray-300">
                    Mix verschillende soorten content: lifestyle, reizen, fitness, fashion. Dit houdt 
                    volgers geïnteresseerd en engaged.
                  </p>
                </div>
                <div className="bg-dark-card rounded-lg p-4 border border-gray-800/30">
                  <h3 className="font-semibold text-white mb-2">✓ Monetisering Strategie</h3>
                  <p className="text-sm text-gray-300">
                    Start met gratis content op Instagram, bouw volgers op, en converteer naar betalende 
                    abonnees op premium platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 border border-purple-400/30 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Klaar om te Starten?</h2>
              <p className="text-purple-100 mb-6">
                Gebruik OnlyFlow om je eigen Emily Pellegrini te creëren. Van training tot dagelijkse content - 
                alles geautomatiseerd.
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="/influencers/train" 
                  className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Start Training
                </a>
                <a 
                  href="/single" 
                  className="bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors border border-purple-500"
                >
                  Genereer Content
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmilypellegriniStrategy
