import amocrm from "../../../lib/backend/amo";

/**
 * Данный метод нужно вызвать после обновления AMO_CODE
 * FIXME ручка временная, т.к. может порушить прод
 */
async function authorize(req, res) {
  try {
    // сбросим oauth_token, чтобы получить его заново
    await amocrm.token.clear();

    // получим новый oauth_token по code
    await amocrm.connection.connect();

    // получим инфу об акканте для проверки
    amocrm.connection.makeRequest("GET", "/api/v4/account");

    res.status(200).json({});
  } catch (error) {
    res.status(500).json({});
  }
}

export default authorize;
