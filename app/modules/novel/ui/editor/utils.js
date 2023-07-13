export const uploadFileUrl = (file, token, controller) => {
    let { authToken, aomUuid } = token
    const url = 'https://uploader.contactodev.com/v1/file'
    let bodyFormData = new FormData()
    bodyFormData.append('file', file)
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Client-Type': 'mac_desktop',
          'Client-Version': '0.03',
          AOM_UUID: aomUuid,
          Authorization: `Bearer ${authToken}`,
        },
        signal: controller.signal,
        body: bodyFormData,
      })
        .then((response) => {
          if (response.status >= 400 && response.status < 600) {
            throw new Error('Bad response')
          } else if (response.status === 201 || response.status === 200) {
            return response.json()
          }
        })
        .then((responseJson) => {
          resolve(responseJson?.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }