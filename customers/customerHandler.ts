import csvParser from "csv-parser";

export const fetchCustomer = async () => {
    const BASE_PATH = "./public";
    const fp = BASE_PATH + "/customers.csv";

    const startTime = Date.now();
    let countData = 0;

    try {
      const fileStream = Bun.file(fp).stream();
      const csvStream = csvParser();
      
      csvStream.on("data", () => {
        countData++;
      });

      for await (const chunk of fileStream) {
        const buffer = Buffer.from(chunk);
        csvStream.write(buffer);
      }

      csvStream.end();
      
      const endTime = Date.now();
      const timeProcess = (endTime - startTime) / 1000; // Convert to seconds

      return {
        count_data: countData,
        time_process: timeProcess.toFixed(2),
      };
    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    }
};
