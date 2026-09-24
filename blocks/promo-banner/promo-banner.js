export default function decorate(block) {
  // rows authored as: Image | Heading | Text | CTA
  const [image, heading, text, cta] = [...block.children].map((row) => row.firstElementChild);

  block.textContent = '';
  block.classList.add('promo-banner');

  if (image) block.append(image);

  const body = document.createElement('div');
  body.className = 'promo-banner-body';
  if (heading) body.append(heading);
  if (text) body.append(text);
  if (cta) {
    const link = cta.querySelector('a');
    if (link) link.className = 'button';
    body.append(cta);
  }
  block.append(body);
}
