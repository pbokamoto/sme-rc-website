// スマートフォン用メニューの開閉
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.global-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', false);
      toggle.setAttribute('aria-label', 'メニューを開く');
    });
  });
}

// フッターの年表示
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// お問い合わせフォーム
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const error = form.querySelector('.form-error');
    if (!form.checkValidity()) {
      const bad = form.querySelector(':invalid');
      error.textContent = bad.validity.valueMissing
        ? '未入力の必須項目があります。ご確認ください。'
        : bad.type === 'tel' ? '電話番号は、市外局番から数字で入力してください（例：0564-47-7748）。'
        : bad.type === 'email' ? 'メールアドレスの形式をご確認ください。'
        : '入力内容をご確認ください。';
      error.hidden = false;
      bad.focus();
      return;
    }
    error.hidden = true;
    const data = new FormData(form);

    // 送信サービス未設定のあいだは、メールソフトを開いて送る
    if (!form.getAttribute('action')) {
      const lines = [];
      data.forEach((v, k) => { if (v) lines.push(`【${k}】\n${v}`); });
      const subject = `【HPお問い合わせ】${data.get('ご用件')}（${data.get('氏名')}様）`;
      location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n\n'))}`;
      return;
    }

    // 受信メールの件名と、返信先（お客様のアドレス）
    data.append('_subject', `【HPお問い合わせ】${data.get('ご用件')}（${data.get('会社・団体名')} ${data.get('氏名')}様）`);
    data.append('_replyto', data.get('メールアドレス'));

    const button = form.querySelector('.form-submit');
    button.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.querySelectorAll('.form-row, .form-agree, .form-actions, .form-lead').forEach((el) => { el.hidden = true; });
      form.querySelector('.form-thanks').hidden = false;
    } catch (err) {
      error.textContent = '送信できませんでした。お手数ですが、お電話またはメールでご連絡ください。';
      error.hidden = false;
      button.disabled = false;
    }
  });
}

// リンク元に合わせて、ご用件を選んでおく（例：index.html?topic=dc#contact）
const topic = document.getElementById('f-topic');
const topicMap = {
  jigyokei: 'ジギョケイ（事業継続力強化計画）の策定について',
  finance: '決算書の分析・財務改善について',
  insurance: '地震保険・休業補償の見直しについて',
  loan: '融資・資金繰りについて',
  dc: '企業型確定拠出年金について',
};
const topicKey = new URLSearchParams(location.search).get('topic');
if (topic && topicMap[topicKey]) topic.value = topicMap[topicKey];
