import { motion } from 'framer-motion';

const MensalConclusionAnalysis = ({ comparisonStats, bigHitsROI }: { comparisonStats: any, bigHitsROI: any }) => {
  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-black text-yellow-400 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <h2 className="text-3xl font-bold mb-4 text-center">Análise de Conclusão</h2>
      <p className="text-lg leading-relaxed">
        Esta análise destaca o impacto significativo que os grandes prêmios têm no desempenho geral.{' '}
        {comparisonStats.avgROI >= 0
          ? 'Mesmo sem considerar os grandes prêmios, o jogador mantém um ROI positivo, indicando uma estratégia sólida e consistente.'
          : 'Sem os grandes prêmios, o jogador apresenta um ROI negativo, sugerindo que esses prêmios são cruciais para a lucratividade geral.'}
      </p>
      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-3">Recomendações:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            {comparisonStats.avgROI >= 0
              ? 'Continue com a estratégia atual nos torneios regulares, que está gerando resultados positivos.'
              : 'Revise a estratégia para torneios regulares visando melhorar o ROI base.'}
          </li>
          <li>
            {comparisonStats.itmRate >= 20
              ? 'A taxa ITM está satisfatória, contribuindo para a estabilidade dos resultados.'
              : 'Trabalhe para melhorar a taxa de ITM e reduzir a variância.'}
          </li>
          <li>
            {bigHitsROI - comparisonStats.avgROI >= 50
              ? 'Os grandes prêmios têm um impacto extremamente significativo no ROI geral.'
              : 'Embora os grandes prêmios aumentem o ROI, o desempenho base também é importante.'}
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default MensalConclusionAnalysis;
