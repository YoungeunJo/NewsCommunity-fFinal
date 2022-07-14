$(document).ready(function () {
  listing();
});

// 카드박스 listing 함수 //
const listing = () => {
    // index.html에서 적용돼, /news로 ajax를 호출해 네이버 뉴스 관련 정보를 수집해 리턴 //
    $.ajax({
        type: 'GET',
        url: '/api/news', // 테스트용 url
        data: {},
        success: function (response) {
            let newsList = response['newsTableList'];
            $('#cards-box').empty();
            for (let i = 0; i < newsList.length; i++) {
                // 서버로 부터 받은 뉴스 리스트의 각 뉴스에 접근해 관련 정보를 받는다.
                let postId = newsList[i]['id'];
                let title = newsList[i]['title'];
                let contents = newsList[i]['explains']
                let imageUrl = newsList[i]['image_url'];
                let view = newsList[i]['view']
                // 받아온 정보를 토대로 card-box html을 구성해준다.
                let html_data = `<div class="col">
                                        <div class="card h-100">
                                            <img class="card-image-box" src=${imageUrl}
                                                 class="card-img-top">
                                            <div class="card-body">
                                                <a href="/NewsCommunity-fFinal/detail.html?name=${postId}"><h5 class="card-title">${title}</h5></a>
                                                <p class="card-text">${contents}</p>
                                                <p class="view">조회수: ${view}</p>
                                            </div>
                                        </div>
                                    </div>`;
                $('#cards-box').append(html_data);
            }
        }
    })
}