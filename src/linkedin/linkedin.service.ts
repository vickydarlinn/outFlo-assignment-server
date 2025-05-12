import { LinkedInClient } from "./linkedin.client";
import LocalAuth from "./authStrategies/localAuth";
import createHttpError from "http-errors";

class LinkedInService {
  private client: LinkedInClient;

  constructor() {
    this.client = new LinkedInClient({
      authStrategy: new LocalAuth({ clientId: "my-linkedin" }),
      puppeteer: {
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });
    this.client.initialize().catch(console.error);
  }

  search(url: string, count: number) {
    if (!url) {
      throw createHttpError(404, "URL not found");
    }
    return this.client.fetchPeople(url, count);
  }
}

export default new LinkedInService(); // singleton – importable everywhere
