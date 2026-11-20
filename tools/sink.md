# 데이터 저장 순서 (크롬)
1. 무신사 탭에서 collector.js 실행 → 탭 제목이 "수집 완료 N" 될 때까지 대기
2. 무신사 탭에 버튼 하나 넣고(클릭은 computer 도구로) `window.__sink = window.open('https://md-studio-lovat.vercel.app/admin.html#pdksink','pdksink')`
3. 새로 열린 관리자 탭(로그인 상태)에 수신기 넣기:
   window.addEventListener('message', async (e) => { if (e.origin!=='https://www.musinsa.com'||!e.data||e.data.type!=='pdk') return;
     const D = JSON.parse(e.data.data); if (!D||!D.P||Object.keys(D.P).length<10) return;
     const w = await supabaseClient.from('site_data').upsert({ id:'pdk', value:D });
     document.title = (w.error?'패더쿠 저장 실패 ':'패더쿠 저장 ') + new Date().toLocaleTimeString(); });
4. 무신사 탭: `window.__sink.postMessage({type:'pdk', data: window.__pdkz}, 'https://md-studio-lovat.vercel.app')`
5. 관리자 탭 제목이 "패더쿠 저장 …" 이면 끝. 사이트는 1분 안에 반영.
