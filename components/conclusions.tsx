import { motion } from 'framer-motion';
import { formatPercentage, formatCurrency } from "@/lib/utils";

const MensalConclusionAnalysis = ({ comparisonStats, bigHitsROI }: { comparisonStats: any, bigHitsROI: any }) => {
  return (
    <motion.div
      className="max-w-full mx-auto p-6 bg-black text-yellow-400 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <h2 className="text-3xl font-bold text-yellow-300 mb-4 text-center flex items-center justify-center gap-2">
        Análise de Conclusão <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      </h2>
      <p className="max-w-4xl text-lg text-center mx-auto leading-relaxed">
        Esta análise destaca como os grandes prêmios podem influenciar significativamente o seu desempenho geral.{' '}
        {comparisonStats.avgROI >= 0
          ? 'Mesmo quando retiramos o impacto dos grandes prêmios, você ainda apresenta um ROI positivo. Isso sugere que sua estratégia base nos torneios regulares é sólida e consistente, o que é um ótimo sinal!'
          : 'Percebemos que, sem a influência dos grandes prêmios, o seu ROI fica em torno de -28%. Isso indica que essas premiações maiores são cruciais para a sua lucratividade atual.'}
      </p>
      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-3">Recomendações:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            {comparisonStats.avgROI >= 0
              ? 'Continue com a estratégia que você tem adotado nos torneios regulares, pois ela está demonstrando ser eficaz e gerar resultados positivos de forma consistente.'
              : 'Reavalie sua estratégia nos torneios regulares, especialmente nas faixas $33-60, $60-130 e $130-450, que apresentam ROI negativo, para buscar um retorno positivo mesmo sem os grandes prêmios.'}
          </li>
          <li>
            {comparisonStats.itmRate >= 20
              ? 'Sua taxa de ITM (29.9%) está muito satisfatória, o que contribui para uma maior estabilidade nos seus resultados. Continue com esse bom trabalho!'
              : 'Para reduzir a variância e ter resultados mais consistentes, seria interessante trabalhar para melhorar a sua taxa de ITM (In The Money).'}
          </li>
          <li>
            {bigHitsROI - comparisonStats.avgROI >= 50
              ? 'Os grandes prêmios têm um impacto extremamente significativo no seu ROI geral, com uma diferença de mais de 17.300%. Embora seja ótimo conseguir essas premiações, é urgente melhorar o desempenho nos torneios regulares.'
              : 'Embora os grandes prêmios contribuam para aumentar o seu ROI, é fundamental que o seu desempenho base nos torneios regulares também seja levado em consideração para uma lucratividade mais consistente.'}
          </li>
          <li>
            <strong>Focar em torneios Bounty Normal e Vanilla Hyper:</strong> Você apresenta ROI positivo nessas modalidades (2.7% e 7.7% respectivamente), então vale a pena focar nelas.
          </li>
          <li>
            <strong>Explorar mais a faixa $500-990:</strong> Você tem um ROI excepcional de 242.1% nessa faixa de buy-in, mesmo com apenas 162 torneios jogados. Considerando o alto desempenho, talvez essa seja uma área para investir mais.
          </li>
          <li>
            <strong>Reduzir volume em Satellites:</strong> Seu ROI em torneios satélite é muito negativo (-69.4% em Normal e -40.9% em Hyper). Se possível, reduza a participação nesses formatos.
          </li>
          {comparisonStats.avgROI < 0 && (
            <>
              <li>
                <strong>Foco na Consistência:</strong> Considerando que a sua lucratividade depende muito dos grandes prêmios, é crucial buscar mais consistência nos resultados menores. Valorize cada vez que você entra na zona de premiação (ITM).
              </li>
              <li>
                <strong>Atenção aos Pay Jumps:</strong> Nos momentos decisivos dos torneios, analise com cuidado os pay jumps. Cada vez que você avança na premiação, está garantindo um lucro maior, o que ajuda a diminuir a dependência dos "big hits".
              </li>
              <li>
                <strong>Estude o ICM:</strong> A análise de spots de ICM (Independent Chip Model) pode ser muito valiosa, especialmente nas mesas finais. Entender o valor das suas fichas em relação à premiação restante pode te ajudar a tomar decisões mais lucrativas.
              </li>
            </>
          )}
        </ul>
      </div>
    </motion.div>
  );
};

export const DossieConclusion = ({ data }: { data: any }) => {
  // Calculate improvement in final tables from period 1 to period 2
  const finalTablesImprovement = 17.3 - 13.4; // 17.3% in period 2 vs 13.4% in period 1
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-3 text-steelersGold">Análise Geral de Desempenho</h3>
        <p className="text-muted-foreground mb-4">
          Sua carreira mostra um desempenho em evolução, com períodos de alta volatilidade. Após 34.180 torneios, você 
          apresenta uma taxa ITM consistente de 29.9%, mas um ROI geral de -4.3%. Os grandes prêmios são fundamentais 
          para seu balanço, com seu maior prêmio de $134.830 em maio de 2022.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3 text-steelersGold">Pontos Fortes</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-medium">Alta taxa ITM (29.9%)</span> - Sua consistência em chegar nas premiações está acima da média, o que proporciona estabilidade.
          </li>
          <li>
            <span className="font-medium">ROI alto em torneios $500-990 (amostra limitada)</span> - ROI de 242.1% em apenas 162 torneios é promissor, mas precisa de mais volume para validar o desempenho.
          </li>
          <li>
            <span className="font-medium">Melhoria significativa nas mesas finais</span> - Aumento de {finalTablesImprovement.toFixed(1)}% na taxa de mesas finais após o big hit de 2023, atingindo 17.3%.
          </li>
          <li>
            <span className="font-medium">ROI positivo em torneios Bounty Normal (2.7%) e Vanilla Hyper (7.7%)</span> - Demonstra habilidade específica nesses formatos.
          </li>
          <li>
            <span className="font-medium">Capacidade de grandes resultados</span> - Três prêmios acima de $29k no histórico, demonstrando potencial para premiações expressivas.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3 text-steelersGold">Áreas de Melhoria</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-medium">ROI geral negativo (-4.3%)</span> - Sem os grandes prêmios, seu ROI cai para -28.24%, indicando forte dependência de resultados excepcionais.
          </li>
          <li>
            <span className="font-medium">Desempenho fraco em satélites</span> - ROI de -69.4% em Satellite Normal e -40.9% em Satellite Hyper sugere problemas estratégicos neste formato.
          </li>
          <li>
            <span className="font-medium">Resultado insatisfatório em torneios high roller ($1k+)</span> - ROI de -51% indica que esta faixa pode não ser ideal para seu estilo de jogo atual.
          </li>
          <li>
            <span className="font-medium">Alta taxa de eliminação na fase inicial</span> - Especialmente no período pós BSOP 2023, com 45.3% de eliminações precoces.
          </li>
          <li>
            <span className="font-medium">Períodos de downswing intensos</span> - Especialmente nos meses de fevereiro/março de 2024, com perdas acumuladas superiores a $68k.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3 text-steelersGold">Recomendações Estratégicas</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium">Ajustar seleção de torneios:</span> Aumentar o volume na faixa $500-990, onde seu ROI é excepcionalmente alto, e reduzir participação em satélites.
          </li>
          <li>
            <span className="font-medium">Revisar estratégia nas fases iniciais:</span> Considerar uma abordagem mais conservadora no início dos torneios, especialmente nos formatos com pior desempenho.
          </li>
          <li>
            <span className="font-medium">Explorar suas forças:</span> Maximizar o volume em torneios Bounty Normal e Vanilla Hyper, focando na faixa de buy-in onde esses formatos são mais rentáveis.
          </li>
          <li>
            <span className="font-medium">Gerenciamento de carreira:</span> Implementar um programa de revisão periódica de resultados, com análise qualitativa das mãos mais relevantes.
          </li>
          <li>
            <span className="font-medium">Definir metas realistas:</span> Buscar um ROI positivo nos torneios regulares (excluindo big hits) como objetivo primário antes de aumentar volume em stakes mais altos.
          </li>
          <li>
            <span className="font-medium">Revisão técnica:</span> Investigar os fatores que contribuem para seu melhor desempenho em torneios $500-990 e aplicar esses insights em outras faixas.
          </li>
          <li>
            <span className="font-medium">Equilíbrio de volume:</span> Considerar reduzir o volume total mensal para focar em qualidade e nas faixas/tipos de torneios onde seu desempenho é superior.
          </li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-card/60 border border-border/40 rounded-lg">
        <h3 className="text-xl font-bold mb-2 text-steelersGold">Conclusão Final</h3>
        <p className="text-muted-foreground">
          Seu perfil de jogador mostra uma combinação de habilidade e potencial, com capacidade comprovada para resultados excepcionais. 
          Para transformar essa capacidade em lucratividade consistente, recomendamos um foco estrito em seus pontos fortes (torneios Bounty Normal 
          e Vanilla Hyper) e na faixa de buy-in onde você tem excelente desempenho ($500-990). Com ajustes estratégicos e melhor seleção de 
          torneios, você tem todos os elementos para converter seu atual ROI negativo em um desempenho consistentemente lucrativo.
        </p>
      </div>
    </div>
  );
};

export default MensalConclusionAnalysis;