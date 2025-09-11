import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function getSensorData() {
  try {
    const data =
      await sql`SELECT * FROM sensor_data ORDER BY inserted_at DESC LIMIT 15`;
    console.log("Received Data: ", data);
    return data;
  } catch (error) {
    console.error(error);
    console.log("Failed to fetch data: ", error);
  }
}

export async function postSensorData(temperature: number, humidity: number) {
  try {
    await sql`INSERT INTO sensor_data (temperature, humidity) VALUES (${temperature}, ${humidity})`;
    return console.log("Data Inserted");
  } catch (error) {
    return console.log("Failed to insert data: ", error);
  }
}
