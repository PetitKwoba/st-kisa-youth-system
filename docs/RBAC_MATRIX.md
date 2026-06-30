# Role and Permission Matrix

| Capability | Member | Treasurer | Secretary | Chairperson | Admin | Auditor |
| --- | --- | --- | --- | --- | --- | --- |
| View own profile and statement | Yes | Yes | Yes | Yes | Yes | Yes |
| View all members | No | Limited | Yes | Yes | Yes | Read-only |
| Post contributions | No | Yes | No | Yes | Yes | No |
| View all financial records | No | Yes | No | Yes | Yes | Read-only |
| Submit own refund/welfare request | Yes | Yes | Yes | Yes | Yes | No |
| Verify financial request | No | Yes | No | No | Yes | No |
| Approve requests | No | No | Yes | Yes | Yes | No |
| Upload own documents | Yes | Yes | Yes | Yes | Yes | No |
| View restricted welfare evidence | Own only | Assigned | Yes | Yes | Yes | Read-only if assigned |
| Export financial reports | Own statement | Yes | No | Yes | Yes | Yes |
| Manage users and roles | No | No | No | No | Yes | No |

All authorization is enforced by the API. Hiding a control in React is only a
usability measure and is not treated as a security boundary.
