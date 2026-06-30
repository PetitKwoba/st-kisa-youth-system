import { Download, Filter, Plus, Search, UserRound, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { formatCurrency } from "../lib/finance";
import { exportMemberRegisterExcel } from "../lib/exports";
import { PageHeader, StatusBadge } from "../components/Ui";
import { useShowcase } from "../state/ShowcaseContext";

export function Members() {
  const { members, addMember, can } = useShowcase();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;
    return members.filter((member) =>
      [member.id, member.name, member.phone, member.position, member.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const member = addMember({
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      email: String(form.get("email")),
      status: "Pending",
      position: String(form.get("position")),
      joined: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    });
    setModalOpen(false);
    setNotice(`${member.id} was created and is pending approval.`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Member register"
        description="Verified group records, balances and membership status."
        actions={
          <>
            <button className="button secondary" type="button" onClick={() => exportMemberRegisterExcel(members)}>
              <Download size={18} /> Export
            </button>
            {can("members:create") && <button className="button primary" type="button" onClick={() => setModalOpen(true)}>
              <Plus size={18} /> Add member
            </button>}
          </>
        }
      />

      <section className="panel table-panel">
        {notice && <p className="success-notice table-notice" role="status">{notice}</p>}
        <div className="table-tools">
          <label className="table-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search members</span>
            <input
              type="search"
              aria-label="Search members"
              placeholder="Search name, member number or phone"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className="button secondary compact" type="button" onClick={() => setQuery("Active")}>
            <Filter size={17} /> Filter
          </button>
          <span className="result-count">{filtered.length} records</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Status</th>
                <th scope="col">Position</th>
                <th scope="col">Joined</th>
                <th scope="col" className="numeric">Balance</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-cell">
                      <span className="avatar">{member.initials}</span>
                      <div>
                        <strong>{member.name}</strong>
                        <span>{member.id} · {member.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={member.status} /></td>
                  <td>{member.position}</td>
                  <td>{member.joined}</td>
                  <td className="numeric table-strong">
                    {formatCurrency(member.balance)}
                  </td>
                  <td>
                    <button className="row-action" type="button" aria-label={`View ${member.name}`}>
                      <UserRound size={17} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <UserRound size={30} />
            <strong>No matching members</strong>
            <span>Try a different name, number or phone.</span>
          </div>
        )}
      </section>
      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="member-title">
            <div className="modal-head">
              <div><p className="eyebrow">Membership</p><h2 id="member-title">Add a member</h2></div>
              <button className="icon-button" type="button" aria-label="Close member form" onClick={() => setModalOpen(false)}><X /></button>
            </div>
            <form className="form-grid" onSubmit={submit}>
              <label className="field full-field">Full name<input name="name" required placeholder="Member's full name" /></label>
              <label className="field">Phone number<input name="phone" required placeholder="+254 7..." /></label>
              <label className="field">Email address<input name="email" type="email" required placeholder="member@example.org" /></label>
              <label className="field full-field">Position<select name="position"><option>Member</option><option>Committee Member</option><option>Vice Official</option></select></label>
              <div className="form-actions full-field">
                <button className="button secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="button primary" type="submit">Create member</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
