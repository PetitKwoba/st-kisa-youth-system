import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import { contributions, members, type Contribution } from "./data.js";

const contributionSchema = z.object({
  memberId: z.string().min(1),
  type: z.enum(["Registration fee", "Welfare kitty", "Table banking", "Fine"]),
  amount: z.number().positive(),
  method: z.enum(["M-Pesa", "Bank", "Cash"]),
  reference: z.string().min(3)
});

export function buildApp() {
  const app = Fastify({ logger: false });
  void app.register(cors, { origin: true });

  app.get("/api/health", async () => ({
    status: "ok",
    dataSource: "in-memory mock repository"
  }));

  app.get("/api/dashboard", async () => ({
    activeMembers: 85,
    welfareKitty: 212500,
    tableBanking: 640000,
    pendingApprovals: 7
  }));

  app.get("/api/members", async () => members);

  app.get("/api/contributions", async () => contributions);

  app.post("/api/contributions", async (request, reply) => {
    const parsed = contributionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        message: parsed.error.issues[0]?.message ?? "Invalid contribution."
      });
    }

    if (parsed.data.type === "Table banking" && parsed.data.amount > 1000) {
      return reply.code(400).send({
        message: "Table banking contributions cannot exceed KES 1,000."
      });
    }

    const member = members.find((item) => item.id === parsed.data.memberId);
    if (!member) {
      return reply.code(404).send({ message: "Member not found." });
    }

    const contribution: Contribution = {
      id: `RCPT-${String(100 + contributions.length).padStart(4, "0")}`,
      date: new Date().toISOString(),
      memberId: member.id,
      memberName: member.name,
      type: parsed.data.type,
      method: parsed.data.method,
      reference: parsed.data.reference,
      amount: parsed.data.amount,
      status: parsed.data.method === "Cash" ? "Pending review" : "Matched"
    };
    contributions.push(contribution);
    return reply.code(201).send(contribution);
  });

  return app;
}
