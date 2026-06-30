import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

async function renderAs(
  path = "/",
  account: "Board administrator" | "Treasurer" | "Member" = "Board administrator"
) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
  await user.click(screen.getByRole("button", { name: new RegExp(account, "i") }));
  return user;
}

describe("St. Kisa member portal", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("requires login and opens the board dashboard", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /board administrator/i })
    );
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
});
