const homeRender = () => {
  const html = `<div class="home">
    <h1>YakumoRan</h1>
    <hr>
    <p>当你看到这个页面，就代表你的机器人已经成功运行起来了</p>
    <p>WARN: 本页面没有权限管理，请勿开放公网访问权限</p>
    <p>GitHub: <a href="https://github.com/iirose-tools/YakumoRan" target="_blank">YakumoRan</a></p>
  </div>`

  document.querySelector('.container').innerHTML = html
}

const storeRender = () => {
  const html = '<p>在写了在写了</p>'

  document.querySelector('.container').innerHTML = html
}

const renderElement = (fid, options) => {
  const { type, id, custom, name, options: opts } = options
  if (opts && !opts.value) opts.value = ''

  if (['text', 'password', 'number'].includes(type)) {
    return `
    <div class="mb-3">
      <label for="${fid}-${id}" class="form-label">${name}</label>
      <input type="${type}" class="form-control" id="${fid}-${id}" placeholder="${opts.placeholder || ''}" value="${opts.value}">
    </div>
    `
  } else if (type === 'select') {
    const options = opts.seletions.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')

    return `
    <div class="mb-3">
      <label for="${fid}-${id}" class="form-label">${name}</label>
      <select class="form-select" value="${opts.value}" id="${fid}-${id}">${options}</select>
    </div>`
  } else if (type === 'checkbox') {
    return `
    <div class="form-check">
      <label for="${fid}-${id}" class="form-label">${name}</label>
      <input class="form-check-input" value="${opts.value}" type="checkbox" id="${fid}-${id}">
    </div>
    `
  } else if (type === 'textarea') {
    return `
    <div class="mb-3">
      <label for="${fid}-${id}" class="form-label">${name}</label>
      <textarea class="form-control" placeholder="${opts.placeholder || ''}" id="${fid}-${id}" style="height: 100px">${opts.value}</textarea>
    </div>
    `
  } else if (type === 'custom') {
    return custom
  }
}

// eslint-disable-next-line no-unused-vars
const submit = async id => {
  const resp = await fetch(`/form/${id}/config`)
  const data = await resp.json()
  const ids = data.filter(form => !!form.id).map(form => `${id}-${form.id}`)
  const values = ids.map(id => {
    const element = document.getElementById(id)
    if (!element) return null
    if (element.type === 'checkbox') return element.checked
    return element.value
  })

  const body = {}

  ids.forEach((id, index) => {
    body[id] = values[index]
  })

  const submit = await fetch(`/form/${id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const result = await submit.json()
  const err = result.err
  if (err) {
    // eslint-disable-next-line no-undef
    return alert(err)
  }

  // eslint-disable-next-line no-undef
  alert('提交成功')
}

const render = async id => {
  if (id === 'home') {
    homeRender()
  } else if (id === 'store') {
    storeRender()
  } else {
    const resp = await fetch(`/form/${id}/config`)
    const data = await resp.json()

    const html = data.map(form => renderElement(id, form))

    document.querySelector('.container').innerHTML = html.join('')
  }
}

fetch('/api/core/menu')
  .then(res => res.json())
  .then(data => {
    const html = data.map(item => {
      return `
      <div class="item" data-id="${item.id}">
        <i class="${item.icon}"></i>
        <p>${item.title}</p>
      </div>
      `
    }).join('')

    document.querySelector('#plugins').innerHTML = html

    document.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.item').forEach(item => {
          item.classList.remove('active')
        })

        item.classList.add('active')

        const id = item.getAttribute('data-id')
        render(id)
      })
    })
  })
