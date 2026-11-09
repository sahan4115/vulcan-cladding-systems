/*
 * About page entry (rebuilt 2026-11-09). Chrome, reveals, contact wall and the two-step
 * enquiry dialog come from product-common.js; this page adds nothing interactive of its own.
 * The former take-off schedule (an "indicative" table with illustrative numbers) was removed:
 * the page now carries only figures Vulcan publishes.
 */
import { initEnquiry } from './product-common.js';
import './about.css'; /* after product-common so the page rules win over the shared sheets */

initEnquiry({
  subject: 'Enquiry',
  eventPrefix: 'about_enquiry',
  doneSent: 'We will be in touch. Samples and certificates go out with the specification.',
});
