const errorCont = {}

/* ****************************************
 * Intentionally trigger a 500 error
 **************************************** */
errorCont.error = async function (req, res, next) {
  const error = new Error('Intentional server error for testing purposes')
  error.status = 500
  next(error)
}

module.exports = errorCont
