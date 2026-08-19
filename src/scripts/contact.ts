/**
 * Contact form enhancement. Loaded on /contact only, and only once the
 * Turnstile site key is configured — until then the form is inert and this
 * module is not emitted at all.
 *
 * Its whole job is the timestamp the endpoint uses as a bot floor: a build-time
 * value would be baked into the HTML and cached, so it has to be stamped in the
 * browser at load.
 */
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const startedAt = form?.querySelector<HTMLInputElement>('input[name="started_at"]');

if (form && startedAt) {
  startedAt.value = String(Date.now());
}
