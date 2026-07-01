import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

async function renderAs(
  path = "/",
  account: "Admin" | "Treasurer" | "Member" | "Secretary" | "Chairperson" = "Admin"
) {
  const emails = {
    Admin: "admin@stkisa.org",
    Treasurer: "treasurer@stkisa.org",
    Member: "member@stkisa.org",
    Secretary: "secretary@stkisa.org",
    Chairperson: "chair@stkisa.org"
  };
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
  await user.type(screen.getByLabelText("Email address"), emails[account]);
  await user.type(screen.getByLabelText("Password"), "Demo@2026");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  return user;
}

describe("St. Kisa member portal", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("keeps credentials private, starts empty, and accepts manual login", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.queryByText("Quick showcase access")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Demo accounts")).not.toBeInTheDocument();
    expect(screen.queryByText(/@stkisa\.org/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Demo@2026")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Email address"), "admin@stkisa.org");
    await user.type(screen.getByLabelText("Password"), "Demo@2026");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      screen.getByRole("heading", { name: /good morning, admin demo/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /members/i })).toBeInTheDocument();
  });

  it("filters members by registration number", async () => {
    const user = await renderAs("/members");
    await user.type(
      screen.getByRole("searchbox", { name: /search members/i }),
      "SKY-004"
    );

    expect(screen.getByText("David Wekesa")).toBeInTheDocument();
    expect(screen.queryByText("Mary Nasimiyu")).not.toBeInTheDocument();
  });

  it.each([
    ["/contributions", "Contributions"],
    ["/statements", "Statement centre"],
    ["/accounting", "Accounting"],
    ["/approvals", "Approval inbox"],
    ["/welfare", "Welfare support"],
    ["/refunds", "Refund requests"],
    ["/investments", "Investment register"],
    ["/documents", "Documents"],
    ["/governance", "Governance"],
    ["/reports", "Reports"]
  ])("renders the %s workspace", async (path, heading) => {
    await renderAs(path);
    expect(
      screen.getByRole("heading", { name: heading, level: 1 })
    ).toBeInTheDocument();
  });

  it("opens and closes the mobile navigation", async () => {
    const user = await renderAs();
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(
      screen.getAllByRole("button", { name: "Close navigation" })[0]!
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("validates and records a contribution in the showcase store", async () => {
    const user = await renderAs("/contributions", "Treasurer");
    await user.click(
      screen.getByRole("button", { name: "Post contribution" })
    );
    const dialog = screen.getByRole("dialog");
    await user.selectOptions(
      within(dialog).getByLabelText("Contribution type"),
      "Table banking"
    );
    await user.clear(within(dialog).getByLabelText("Amount (KES)"));
    await user.type(within(dialog).getByLabelText("Amount (KES)"), "1200");
    await user.type(
      within(dialog).getByLabelText("Transaction reference"),
      "TEST-001"
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Record contribution" })
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "cannot exceed KES 1,000"
    );

    await user.clear(within(dialog).getByLabelText("Amount (KES)"));
    await user.type(within(dialog).getByLabelText("Amount (KES)"), "1000");
    await user.click(
      within(dialog).getByRole("button", { name: "Record contribution" })
    );
    expect(
      await within(dialog).findByText("Contribution recorded")
    ).toBeInTheDocument();
  });

  it("restricts a member to member-facing tools and personal records", async () => {
    await renderAs("/", "Member");
    expect(screen.queryByRole("link", { name: "Members" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Accounting" })).not.toBeInTheDocument();
    expect(screen.getByText("SKY-004")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Documents" })).toBeInTheDocument();
  });

  it("keeps invalid credentials on the login page", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    await user.type(screen.getByLabelText("Email address"), "admin@stkisa.org");
    await user.type(screen.getByLabelText("Password"), "incorrect");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid email or password"
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("credentials shown");
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  });

  it("shows approval actions only to the role responsible for the current step", async () => {
    await renderAs("/approvals", "Treasurer");
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    cleanup();
    localStorage.removeItem("sky_showcase_session_v4");

    await renderAs("/approvals", "Secretary");
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.getByText(/awaiting treasurer action/i)).toBeInTheDocument();
  });
});
