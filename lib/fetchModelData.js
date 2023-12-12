/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    console.log(url);
    // setTimeout(() => reject(new Error(
    //   { status: 501, statusText: "Not Implemented" })), 
    //   0
    // );
    // On Success return:
    // resolve({data: getResponseObject});
    const httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          try {
            const responseData = JSON.parse(httpRequest.responseText);
            resolve({ data: responseData });
          } catch (error) {
            reject(new Error(
              { status: httpRequest.status, statusText: httpRequest.statusText },
              0
            ));
          }
        }
      }
    };

    httpRequest.open('GET', url);
    httpRequest.send();
  });
}

export default fetchModel;
