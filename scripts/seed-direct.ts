import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { sql } from "@vercel/postgres"

async function main() {
  try {
    console.log("Starting database seed...")

    // Create table if it doesn't exist
    await sql`
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
    `

    await sql`
      CREATE INDEX IF NOT EXISTS "DadosTorneio_data_idx" ON "DadosTorneio" ("data");
    `

    await sql`
      CREATE INDEX IF NOT EXISTS "DadosTorneio_tipoTorneio_idx" ON "DadosTorneio" ("tipoTorneio");
    `

    // Read CSV file
    const csvFilePath = path.resolve(__dirname, "../data/tournaments.csv")
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })

    console.log(`Found ${records.length} records in CSV file`)

    // Process and insert records
    let insertedCount = 0

    for (const record of records) {
      const tournament = {
        rede: record.Rede,
        data: new Date(record.Data),
        entradas: record.Entradas ? Number.parseInt(record.Entradas) : null,
        profit: Number.parseFloat(record.Profit),
        posicao: record.Posição ? Number.parseInt(record.Posição) : null,
        prize: record.Prize ? Number.parseFloat(record.Prize) : null,
        buyIn: record["Buy-In"] ? Number.parseFloat(record["Buy-In"]) : null,
        tipoTorneio: record["Tipo de Torneio"],
        mesAno: record["Mês/Ano"],
        buyInRange: record.Buy_In_Range,
      }

      await sql`
        INSERT INTO "DadosTorneio" ("rede", "data", "entradas", "profit", "posicao", "prize", "buyIn", "tipoTorneio", "mesAno", "buyInRange")
        VALUES (${tournament.rede}, ${tournament.data}, ${tournament.entradas}, ${tournament.profit}, 
                ${tournament.posicao}, ${tournament.prize}, ${tournament.buyIn}, ${tournament.tipoTorneio}, 
                ${tournament.mesAno}, ${tournament.buyInRange})
      `

      insertedCount++

      if (insertedCount % 100 === 0) {
        console.log(`Inserted ${insertedCount} records...`)
      }
    }

    console.log(`Database seed completed. Inserted ${insertedCount} records.`)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

main()

