/* ═══════════════════════════════════════════════════════════════
   CLIENT REVIEWS shown on the home page under "What clients say".

   To add one: copy a block below, paste it at the TOP of the list
   (newest first), fill it in, and keep the comma after the closing }.
     name     required
     company  optional, e.g. "CEO, Acme" (delete the line if none)
     stars    optional, 1 to 5 (delete the line if none)
     text     required. Use \" if the review itself contains quotes.

   { name: "Jane Smith",
     company: "CEO, Acme Industrial",
     text: "The ZKK market report gave us the sizing we needed." },
   ═══════════════════════════════════════════════════════════════ */
var REVIEWS = [

  { name: "Brendan Pierce",
    company: "Co-Founder, B&E Capital",
    text: "ZKK is easily the best consulting firm I’ve personally worked with. Their research combines deep industry insights, well-sourced analysis, and personalized consultation. The quality and depth of their work truly set them apart, and they deliver on exactly what they promise." },

  { name: "Madi Heck",
    company: "CEO, SageSpectra",
    text: "Zolomon was a hardworking and dependable member of the SageSpectra team who supported our market research, market sizing, financial analysis, and competitive analysis. He approached each project thoughtfully and delivered thorough, high-quality work." },

  { name: "DynamicKPIs",
    text: "We hired Jad and Zolomon to review and quality check data and KPI outputs for various upgrades being rolled out to our clientele. They were thorough and diligent in their analysis, and proactive in suggesting modifications to our output format and internal processes that improved the results of our latest analytics. We will use them again on our next update." },

];
