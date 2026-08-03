import json

with open('/sessions/elegant-compassionate-mayer/mnt/listen-learn-live/concepts.json') as f:
    data = json.load(f)

ids = [631, 94, 234, 61, 126, 130, 422, 556, 564, 569]
concepts = {c['id']: c for c in data if c['id'] in ids}

rewrites = {
    631: {'hook':'Shift payment from upfront cost to shared savings; removes buyer risk entirely.','plain':'Instead of selling a product for a fixed price, provide it free and charge a percentage of the measurable benefit it creates. Matthew Boulton and James Watt did this in 1775 with steam engines, charging 50% of the coal savings instead of asking mines to buy the machine upfront.','analogy':'Solar panels go on your roof at no cost; the installer takes a cut of your smaller electricity bill.'},
    94: {'hook':'Nobody buys a Porsche for the engineering or argues politics for the truth.','plain':'From Will Storr: careers, consumption, political opinions, and social media arguments are driven by the need to raise or defend status within your tribe. People are not exchanging ideas; they are performing rank.','analogy':'Two strangers debate a topic neither researched, proving to the room they belong on the smart side.','prompt':'What is one belief you argue for publicly that, if you are brutally honest, exists partly to signal belonging to your tribe rather than because you have actually examined it?'},
    234: {'term':'Language That Hides the Problem','hook':'The right vocabulary can become the best excuse for ignoring the real problem.','plain':'Sophisticated psychological vocabulary can prevent you from naming a simple, concrete issue. You can articulate your triggers and your need for space, yet still cannot admit the person you are with treats you badly. The jargon becomes a shield against reality.','analogy':'Debating thermostat settings in a house that is on fire.'},
    61: {'hook':'Where you place the cause of your life determines what you do with it.','plain':'Internal locus: you believe your choices drive your outcomes. External locus: you believe outside forces do. People with an internal locus tend to be more resilient and more successful over the long run.','analogy':'Two runners miss a qualifying time: one books a coach, the other blames the course.'},
    126: {'hook':'One person with the right audience can beat a twenty-person team without one.','plain':'A single person with expertise, an audience, and a digital product can earn significant income without employees, overhead, or investors. The internet gives individuals the reach and scale that used to require entire teams.','analogy':'A writer with fifty thousand subscribers selling a ninety-seven euro guide can out-earn an agency with twenty staff.'},
    130: {'hook':'Your exact intersection of obsessions creates a category nobody else can occupy.','plain':'Rather than picking a niche externally, your specific combination of interests creates a category of one that nobody else can replicate. Your unique intersection is your brand.','analogy':'A former nightclub DJ who reads philosophy and makes self-improvement content occupies a slot no algorithm could have assigned.'},
    422: {'hook':'The worst betrayal is discovering the beginning was manufactured.','plain':'The discard hurts, but the real pain comes later: realizing the love bombing was never real. The cycle did not start when they left; it started the moment they made you feel like the center of their world. You were not falling in love; you were being set up.','analogy':'Rewatching a film knowing the ending reveals every early scene was already lying to you.'},
    556: {'plain':'When someone asserts something, it is their job to support it, not yours to disprove it. Demanding that doubters prove a negative is a way of dodging the work of backing your own claim.','analogy':'Someone says treasure is buried in your garden; proving it is their job, not yours to excavate.'},
    564: {'hook':'Money now beats the same amount later, every time.','plain':'A dollar today can be invested or spent immediately, making it worth more than the same dollar received in the future. Timing is not neutral; inflation and opportunity cost make later genuinely cheaper.','analogy':'Given a choice between a thousand euros now and a thousand in a year, you take it now.'},
    569: {'plain':'People divide money into separate mental buckets and treat each pot as if it were different money, even when dollars are interchangeable. This leads someone to protect a low-yield savings account while carrying high-interest debt, letting labels override the math.','analogy':'Keeping the holiday jar untouched on the counter while a credit card at 20% drains from another drawer.'}
}

for id_ in ids:
    old = concepts[id_]
    rw = rewrites.get(id_, {})
    changed = [k for k, v in rw.items() if old.get(k) != v]
    print(str(id_) + ': ' + ', '.join(changed))
