# 03: Source checks: prefixed storage, link home, service worker stays in its own path

**What to build:** The Ready check also reads the Game's local repo (`Projects\<slug>\`) and checks suite rules 2, 3 and 5, so Dad finds unprefixed storage, a missing house button, or a service worker that could claim the site root before the kids do. See `../spec.md` (Ready check module → Facts, Rule exceptions).

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Storage check (rule 2): IndexedDB database names, localStorage keys and cache names found in the source must start with the slug; anything else fails, unless it's on an explicit exception list passed in as input (e.g. Doodle Monsters' Night 1 test page names)
- [ ] Link home check (rule 5): the Game's source contains a link to the site root `/`
- [ ] Service worker check (rule 3): any service worker registration's scope stays inside `/<slug>/`; a registration at `/` fails
- [ ] Each failure drafts one ticket citing its rule
- [ ] `node --test` covers each check with hand-built facts: each rule broken alone fails exactly its check; an exception-listed name passes; a root-scoped worker fails
- [ ] Real run: Doodle Monsters and Secret Script Studio both fail "link home" and pass storage and service worker (with Night 1 on the exception list)
