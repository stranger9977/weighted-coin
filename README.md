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

> This list is being expanded from a dedicated research pass into youth gambling-prevention curricula, partner organizations, and the academic sources behind the brain/PASPA claims. The final slide (`Sources`) and this section will be updated with the cited list.

- National Council on Problem Gambling (NCPG) — helpline + awareness materials — https://www.ncpgambling.org
- *(more cited curricula and partner orgs to be added)*

## Editing

Three files, no build step:
- `index.html` — the slides (reveal.js via CDN)
- `deck.css` — theme + styling for the interactive toys
- `deck.js` — coin simulator, bankroll chart, parlay calculator

Edit, commit, push — GitHub Pages redeploys automatically.
