# The Weighted Coin 🪙

An interactive HTML slide deck for teaching high-schoolers how sports betting actually works — built to be taught, not just watched.

**Live:** https://stranger9977.github.io/weighted-coin/

Built by a former teacher who now builds NFL betting models for a sportsbook. The whole deck hangs on one metaphor: a coin that *looks* fair but is quietly weighted in the house's favor. That tilt is the **vig** — and it's the entire business.

## How to teach it

- Open the live link on a projector. Navigate with **← / →** arrow keys.
- Press **S** for the speaker view (notes for every slide, in a separate window).
- Press **F** for fullscreen, **ESC** for the slide overview.
- It works on a phone too, so students can poke at the interactive parts themselves.

### The two interactive toys
1. **The coin simulator (slides 2–3).** Flip a fair coin and it feels fair. Then flip the toggle to *"the book's coin"* and run 100 flips — the bankroll line marches down even though you still win ~48% of the time. That invisible drift is the lesson.
2. **The parlay calculator (slide 6).** Drag the slider from 1 to 10 legs and watch the house's cut balloon from ~4.5% to ~37%. Pure multiplication; genuinely jaw-dropping.

## The math (it's exact)

| Concept | Number | Why |
|---|---|---|
| Break-even win rate at −110 | **52.38%** | 110 ÷ (110 + 100) |
| House edge per even-money flip | **~4.76%** | you win only 47.62% |
| Parlay hold (n legs of −110) | **1 − 0.95455ⁿ** | the vig compounds every leg |
| 4-leg parlay hold | **~17%** | vs ~4.5% on a single bet |
| 10-leg parlay hold | **~37%** | why every promo is a parlay |

## A note on who delivers this

Being an insider is the credibility — but lead as the *math teacher*, and let "I build these models for a living" be the reveal, not the headline. The goal is never "gambling is evil." It's "see the machine clearly." A kid who understands the vig, the parlay compound, and the engineered habit is far better protected than one who just got a lecture. Always end on the help resources; never glamorize the product or the job.

## Help resources

- **Call or text 1-800-GAMBLER** — National Problem Gambling Helpline, confidential, all 50 states.
- **NCPG chat:** https://www.ncpgambling.org/chat

## Sources & curricula to build from

Compiled from a fact-checked research pass (20 claims confirmed via 3-vote adversarial verification; 5 dropped as refuted). Caveats are kept honest on purpose — this is for a data scientist.

### Curricula a teacher can adopt or adapt
- **Stacked Deck** — Williams & Wood, Hazelden, 2nd ed. 2022. 5–6 interactive lessons for grades 9–12 on the history of gambling, **true odds and the "house edge,"** gambling fallacies, problem-gambling risk factors, and decision-making ("approach life as a *smart gambler*"). The strongest-evidenced youth program: a controlled Alberta study (949 intervention vs. 291 control students) found improved knowledge, more negative attitudes, greater resistance to fallacies, and reduced gambling frequency/problem rates at 4-month follow-up.
  - *Caveat:* effectiveness studies were run by the program's own developers (2003–07), found **no** significant change in money lost, and predate modern sports betting. Facilitator's Guide (Grades 9–12): ISBN 9781592858934.
  - https://www.hazelden.org/store/item/557330 · https://pubmed.ncbi.nlm.nih.gov/20405219/ · https://eric.ed.gov/?id=EJ886815
- **Florida Council on Compulsive Gambling (FCCG)** — free K–12 curriculum built on Common Core probability standards ("What Are My Chances?": experimental/theoretical → independent/conditional probability, tied to real gambling odds). Also co-developed *"When Gambling Takes Control of the Game"* with the NCAA + NFHS for student-athletes. *Caveat:* lessons dated 2005, sports curriculum ~2013 (pre-PASPA).
  - https://gamblinghelp.org/prevention/
- **ICRG — "Talking with Children About Gambling"** — free, research-based, developed with the Division on Addiction at Cambridge Health Alliance (a Harvard Medical School affiliate). Parent-primary (educators secondary), aimed at the "tween" years (9–13) up. The **NFL is funding an update** (announced June 2025) for parents, coaches, and educators. It explicitly recommends adding **probability and randomness to math classes** as prevention.
  - https://naadgs.org/talking-with-children-about-gambling-icrg/ · https://www.icrg.org

### Organizations: free materials, grants & training
- **NCPG — Agility Grants** — NFL-Foundation-funded ($1.5M, 2025–27); explicitly target middle/high-school/college students and athletes; fund primary (haven't gambled) and secondary (limited experience) prevention.
  - https://www.ncpgambling.org/programs-resources/agility-grants/
- **North Carolina Problem Gambling Program** — **up to $5,000 mini-grants** to middle/high schools to implement Stacked Deck, including educator training, tech support, and all materials (in-class, virtual, or self-guided LMS). (Apply via your school, not as an individual.)
- **New York (NYCPG + NYS PTA)** — *free printed materials shipped to your school* for "Empower Every Child to Be Gambling Free" events; the **YOU Decide** project (under-25) and **Mind Ride** interactive experience for home/classroom.
  - https://nyspta.org/empower-every-child-to-be-gambling-free/ · https://youdecideny.org
- **NCAA + EPIC Global Solutions** — in-person sports-gambling harm-prevention for student-athletes (100k+ reached), free to member schools through 2027. The training **"An Introduction to Youth Problem Gambling"** is built for teachers, coaches, athletic directors, and counselors — not just clinicians.
  - https://www.ncaa.org/news/2023/2/22/media-center-ncaa-and-epic-provide-sports-gambling-harm-prevention-education-to-over-10-000-student-athletes.aspx · https://www.epicglobalsolutions.com/ncaa/

### The gap this deck fills
**No verified, evidence-based curriculum yet teaches the deliberate design of modern app-era sportsbook products** — parlays, same-game parlays, live/in-play betting, deposit/free-bet promos, push notifications — or how they obscure true odds and compound the house edge. That is precisely the content a sportsbook data scientist is uniquely positioned to build. On the rise among teen boys since the 2018 PASPA repeal and how apps use psychology to retain users:
- https://www.educationnext.org/teen-boys-are-gambling-a-lot-legal-sports-betting/
- https://www.scientificamerican.com/article/how-sports-betting-apps-use-psychology-to-keep-users-gambling/
- https://www.ncaa.org/news/2025/1/14/media-center-ncaa-study-education-shows-promise-in-changing-sports-betting-behaviors-harassment-from-bettors-prevalent-in-di.aspx
- https://www.addiction.rutgers.edu/the-rise-of-sports-betting-among-college-students-a-growing-public-health-concern/

### On who delivers the message
Evidence supports trained teachers, coaches, and parents as messengers. The one wrinkle the research flags: responsible-gambling messaging from someone employed by an operator can be viewed skeptically. No source forbids it — but pre-empt it by leading with your teacher/independent identity and being transparent. (See the "who delivers this" note above.)

### Youth risk context (for framing, not fear)
Cited figures: roughly **2–7% of young people** experience a gambling problem vs. **~1% of adults**, with **boys at higher risk** — and an older national estimate that ~70% of 14–19-year-olds gambled in the past year. Treat exact percentages as directional; the direction is well established.

### National helpline
- **Call or text 1-800-GAMBLER** — National Problem Gambling Helpline, confidential, all 50 states.
- **NCPG chat:** https://www.ncpgambling.org/chat

## Editing

Three files, no build step:
- `index.html` — the slides (reveal.js via CDN)
- `deck.css` — theme + styling for the interactive toys
- `deck.js` — coin simulator, bankroll chart, parlay calculator

Edit, commit, push — GitHub Pages redeploys automatically.
