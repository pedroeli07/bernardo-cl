CREATE TABLE IF NOT EXISTS "DadosTorneio" (
  "id" SERIAL PRIMARY KEY,
  "rede" TEXT,
  "data" TIMESTAMP NOT NULL,
  "entradas" INTEGER,
  "profit" DECIMAL NOT NULL,
  "posicao" INTEGER,
  "prize" DECIMAL,
  "buyIn" DECIMAL,
  "tipoTorneio" TEXT,
  "mesAno" TEXT,
  "buyInRange" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "DadosTorneio_data_idx" ON "DadosTorneio" ("data");
CREATE INDEX IF NOT EXISTS "DadosTorneio_tipoTorneio_idx" ON "DadosTorneio" ("tipoTorneio");

