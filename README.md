Notes/TODO:

- When another service such as the product purchase service sends over a user account payload, we trigger an email to set the password here. So we need a webhook to accept that user payload, a mechanism to send out an email with a 30min token, then finally an endpoint to let a user set their password.
