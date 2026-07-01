# Role and Permission Matrix

| Capability | Member | Treasurer | Secretary | Chairperson | Admin | Auditor |
| --- | --- | --- | --- | --- | --- | --- |
| View own profile and statement | Yes | Yes | Yes | Yes | Yes | Yes |
| View all members | No | Limited | Yes | Yes | Yes | Read-only |
| Post contributions | No | Yes | No | Yes | Yes | No |
| View all financial records | No | Yes | No | Yes | Yes | Read-only |
| Submit own refund/welfare request | Yes | Yes | Yes | Yes | Yes | No |
| View approval inbox | No | Yes | Yes | Yes | Read-only | Read-only |
| Verify financial request | No | Current Treasurer step only | No | No | No | No |
| Approve welfare request | No | No | Current Secretary step only | Final step only | No | No |
| Approve refund or investment request | No | No | No | Final step only | No | No |
| Upload own documents | Yes | Yes | Yes | Yes | Yes | No |
| View restricted welfare evidence | Own only | Assigned | Yes | Yes | Yes | Read-only if assigned |
| Export financial reports | Own statement | Yes | No | Yes | Yes | Yes |
| Manage users and roles | No | No | No | No | Yes | No |

For this browser-only showcase, the state layer rejects unauthorized,
out-of-order, repeated, and incomplete approval actions in addition to hiding
unavailable controls. Production must repeat these checks in the API; browser
checks are not a sufficient security boundary.

## Enforced approval order

- Welfare: Treasurer verification, Secretary approval, Chairperson final approval.
- Refund: Treasurer verification, Chairperson final approval.
- Investment: Treasurer verification, Chairperson final approval.
- Rejection closes a request immediately and requires a reason.
- Admin and Auditor can inspect the complete history but cannot approve.
