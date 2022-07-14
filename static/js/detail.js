const DESC = "DESC";
const ASC = "ASC";

$(document).ready(function () {
  console.log("start!!!!")
  detail_listing();
  getComments();
  getCommentCount();
  addView();
});


// 조회수 증가 함수
function addView() {
    let newsId = getNewsId();
    $.ajax({
        type: "PUT",
        url: '/api/news/views/' +newsId,
        success: function (response) {
        }
    });
}

const detail_listing = () =>{
    let news_id = location.href.split("?")[1].split("=")[1];
    console.log("test!!!")
    console.log("이 뉴스의 id는 바로 ~~~~: " + news_id)

    $.ajax({
        type: 'GET',
        url: '/api/news/details/'+news_id,
        data: {},
        success: function (response) {
            let newsObj = response['body']['result'];
            $('#news-box').empty();
            // 서버로 부터 받은 뉴스 리스트의 각 뉴스에 접근해 관련 정보를 받는다.
            let postId = newsObj['id'];
            let title = newsObj['title'];
            let contents = newsObj['summary']
            let newsUrl = newsObj['news_url']
            let imageUrl = newsObj['image_url'];
            let writeTime = newsObj['write_time']
            console.log(writeTime)
            console.log(title)
            let view = newsObj['view']
            // 받아온 정보를 토대로 card-box html을 구성해준다.
            let html_data = `<div class="news_title title"><h4>${title}</h4></div>
                                <div class="news_time level-left">
                                    <small>${writeTime}</small>
                                </div>
                                <div class="news_time level-left">
                                    <small>조회수: ${view}</small>
                                </div>

                                <div class="news_icon level-right">
                                    <div class="news_url level-item">
                                        <a href="${newsUrl}" target="_blank">
                                            <span class="icon is-small"><i class="icon_ fa-solid fa-link"></i></span>
                                        </a>
                                    </div>
                                    <div id="bookmark" class="bookmark level-item">
                                        <div id="${postId}">
                                            <a class="is-sparta" aria-label="bookmark"
                                               onclick="toggle_bookmark(${postId})">
                                                                            <span class="icon is-small"><i class="icon_ fa fa-solid fa-bookmark-o"
                                                                                                           aria-hidden="true"></i></span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <span class="news_photo"><img src="${imageUrl}" alt="Image"></span>
                                <div class="news_summary" style="white-space: pre-line">${contents}</div>`;
            $('#news-box').append(html_data);

        }
    })
}

String.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
};

// 현재 보고 있는 뉴스의 아이디(PK)를 얻는 함수
function getNewsId() {
    let params = new URLSearchParams(document.location.search);
    let newsId = params.get("name");
    return newsId;
}

// 댓글 작성 함수
function postComment() {
    let content = $('#comment').val();
    let newsId = getNewsId();
    let data = {
        "content": content,
        "newsId": newsId
    }
    $.ajax({
        type: "POST",
        url: `/api/user/comments`,
        contentType: "application/json", // JSON 형식으로 전달함을 알리기
        data: JSON.stringify(data),
        success: function (response) {
            alert('댓글이 성공적으로 작성되었습니다.');
            $('#comment').val("");
            getComments();
            getCommentCount();
        }
    });
}

// 댓글 작성 시간 단위
function time2str(date) {
    let today = new Date();
    let time = (today - date) / 1000 / 60  // 분

    if (time < 60) {
        return parseInt(time) + "분 전"
    }
    time = time / 60  // 시간
    if (time < 24) {
        return parseInt(time) + "시간 전"
    }
    time = time / 24
    if (time < 7) {
        return parseInt(time) + "일 전"
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

// 좋아요 갯수 단위
function num2str(count) {
    if (count > 10000) {
        return parseInt(count / 1000) + "K"
    }
    if (count > 500) {
        return parseInt(count / 100) / 10 + "K"
    }
    if (count == 0) {
        return ""
    }
    return count
}

// 댓글 리스팅
function getComments() {
    let newsId = getNewsId();
    $("#comment-box").empty()
    $.ajax({
        type: "GET",
        url: `/api/user/comments/${newsId}`,
        success: function (response) {
            for (let i=0; i<response.length; i++) {
                let comment = response[i];
                let commentId = comment.commentId;
                let modifiedDate = comment.modifiedAt;
                let time = time2str(new Date(modifiedDate));
                let content = comment.content;
                let username = comment.profileResponseDto.username;
                let nickname = comment.profileResponseDto.nickname;
                let profilePicLink = comment.profileResponseDto.profile_pic == "default" ? "/static/profile_pics/profile_placeholder.png" : "https://bulma.io/images/placeholders/128x128.png";
                addHTML(commentId, time, content, username, nickname, profilePicLink);
            }
        }
    })
}

// 댓글 개수 가져오는 함수 + 정렬 UI
function getCommentCount() {
    let newsId = getNewsId();
    $('#comment_box-head').empty();
    $.ajax({
        type: "GET",
        url: `/api/user/comments/count/${newsId}`,
        success: function (response) {
            let tempHtml = `
                <div class="comment-head">
                    <div id="comment-count-box" class="comments_count level-left">
                        <p class="subtitle is-5">
                            <strong>${response}</strong>
                        </p>
                        <small style="margin-bottom: 1rem">&nbsp;comments</small>
                    </div>
            
                    <div class="dropdown is-right is-hoverable level-right">
                        <div class="dropdown-trigger">
                            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu3">
                                <span id="sort_comments_txt">댓글 정렬</span>
                                <span class="icon is-small">
                                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                                </span>
                            </button>
                        </div>
                        <div class="dropdown-menu" id="dropdown-menu3" role="menu">
                            <div class="dropdown-content">
                                <a class="dropdown-item" onclick="getSortedComments(DESC)">
                                    최신 순
                                </a>
                                <a class="dropdown-item" onclick="getSortedComments(ASC)">
                                    오래된 순
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;
            $('#comment_box-head').append(tempHtml);
        }
    })
}

// 댓글 정렬
function getSortedComments(direction) {
    let newsId = getNewsId();
    $("#comment-box").empty()
    $.ajax({
        type: "GET",
        url: `/api/user/comments/sort/${newsId}?direction=${direction}`,
        success: function(response) {
            for (let i=0; i<response.length; i++) {
                let comment = response[i];
                let commentId = comment.commentId;
                let createdDate = comment.createdAt;
                let time = time2str(new Date(createdDate));
                let content = comment.content;
                let username = comment.profileResponseDto.username;
                let nickname = comment.profileResponseDto.nickname;
                let profilePicLink = comment.profileResponseDto.profile_pic == "default" ? "/static/profile_pics/profile_placeholder.png" : "https://bulma.io/images/placeholders/128x128.png";
                addHTML(commentId, time, content, username, nickname, profilePicLink);
            }
        }
    })
}

function addHTML(commentId, time, content, username, nickname, profilePicLink) {

    let currentLoginUserName = $.ajax({
        async: false,
        url: "/api/user/me",
        type: "GET",
        dataType: "text"
    }).responseText;

    let likesCount = $.ajax({
        async: false,
        url: `/api/user/likes/count/${commentId}`,
        type: "GET",
        dataType: "text"
    }).responseText;

    let tempHtml = ``;
    if (currentLoginUserName == username) {

        tempHtml = `<article class="media comment-show">
                        <figure class="media-left">
                            <p class="image is-64x64">
                                <img src=${profilePicLink}>
                            </p>
                        </figure>
                        <div class="media-content">
                            <div class="content">
                                <p>
                                    <strong>${nickname}</strong> <small>@${username}</small> <small>${time}</small>
                                    <br>
                                    <span id="${commentId}-content">${content}</span>
                                </p>
                            </div>
                            <nav class="level is-mobile">
                                <div class="level-left">
                                    <a class="level-item">
                                        <span class="heart icon is-small"><i onclick="updateLike(${commentId})" class="fa fa-heart-o"></i></span><span class="${commentId}-like-number like-count">${likesCount}</span>
                                    </a>
                                </div>
                            </nav>
                        </div>
                        <div class="media-right">
                            <i class="fa-solid fa-pen-to-square" onclick="showEditTextarea(${commentId})"></i>
                            <i class="fa-solid fa-trash-can" onclick="deleteConfirm(${commentId})"></i>
                        </div>
                    </article>
                    <div id="${commentId}-editor-container" class="comment-editarea">
                        <textarea id="${commentId}-editor" class="textarea" placeholder="수정할 내용 입력">${content}</textarea>
                        <button class="edit-btn button is-info" onclick="editComment(${commentId})">수정</button>
                    </div>`;
    } else {
        tempHtml = `<article class="media comment-show">
                        <figure class="media-left">
                            <p class="image is-64x64">
                                <img src=${profilePicLink}>
                            </p>
                        </figure>
                        <div class="media-content">
                            <div class="content">
                                <p>
                                    <strong>${nickname}</strong> <small>@${username}</small> <small>${time}</small>
                                    <br>
                                    ${content}
                                </p>
                            </div>
                            <nav class="level is-mobile">
                                <div class="level-left">
                                    <a class="level-item">
                                        <span class="heart icon is-small"><i onclick="updateLike(${commentId})" class="fa fa-heart-o"></i></span><span class="${commentId}-like-number like-count">${likesCount}</span>
                                    </a>
                                </div>
                            </nav>
                        </div>
                    </article>`;
    }

    $("#comment-box").append(tempHtml);
}

function showEditTextarea(commentId) {
    document.getElementById(`${commentId}-editor-container`).classList.toggle("comment-editarea");
}


// 댓글 수정 함수
function editComment(commentId) {
    let content = $(`#${commentId}-editor`).val();
    let data = {
        "content": content
    }

    $.ajax({
        type: "PUT",
        url: `/api/user/comments/${commentId}`,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            alert('댓글을 수정했습니다.');
            window.location.reload();
        }
    });
}

// 댓글을 삭제하기 전 한 번 더 물어보게 하기 위한 자바스크립트 내장 confirm 함수 사용
function deleteConfirm(commentId) {
    if (confirm('정말로 삭제하시겠습니까?')) {
        deleteComment(commentId)  // 확인 누르면 댓글 삭제
    } else {
        return false  // 취소 누르면 아무런 일도 일어나지 않음
    }
}

// 댓글 삭제 함수
function deleteComment(commentId) {
    $.ajax({
        type: "DELETE",
        url: `/api/user/comments/${commentId}`,
        success: function (response) {
            alert('댓글 삭제에 성공하였습니다.');
            window.location.reload();
        }
    });
}

// 좋아요 기능
function updateLike(commentId) {
        let data = {}
        $.ajax({
            type: "POST",
            url: `/api/user/likes/${commentId}`,
            contentType: "application/json", // JSON 형식으로 전달함을 알리기
            data: JSON.stringify(data),
            success: function(response) {
                let likesCount = $.ajax({
                    async: false,
                    url: `/api/user/likes/count/${commentId}`,
                    type: "GET",
                    dataType: "text"
                }).responseText;
                $(`.${commentId}-like-number`).empty();
                $(`.${commentId}-like-number`).append(likesCount);
            }
        })
}

// 북마크 여부 확인
function bookmarked(post_id) {
    $("#bookmark").empty()
    $.ajax({
        type: "GET",
        url: `/bookmarked?post_id_give=${post_id}`,
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let bookmark_by_me = response["bookmark_by_me"]
                let icon = bookmark_by_me ? "fa-bookmark" : "fa-bookmark-o"
                let temp_html = `<div id="${post_id}" class="bookmark">
                                    <a class="level-item is-sparta" aria-label="bookmark"
                                           onclick="toggle_bookmark(${post_id})">
                                                    <span class="icon is-small"><i class="icon_ fa fa-solid ${icon}"
                                                                                   aria-hidden="true"></i></span>
                                    </a>
                                  </div>`
                $("#bookmark").append(temp_html)
            }
        }
    })
}

// 북마크, 북마크 취소
function toggle_bookmark(post_id) {
    let $i_bookmark = $(`#${post_id} a[aria-label='bookmark']`).find("i")
    if ($i_bookmark.hasClass("fa-bookmark")) {
        $.ajax({
            type: "POST",
            url: "/bookmark",
            data: {
                post_id_give: post_id,
                action_give: "unbookmark"
            },
            success: function (response) {
                $i_bookmark.addClass("fa-bookmark-o").removeClass("fa-bookmark")
            }
        })
    } else {
        $.ajax({
            type: "POST",
            url: "/bookmark",
            data: {
                post_id_give: post_id,
                action_give: "bookmark"
            },
            success: function (response) {
                $i_bookmark.addClass("fa-bookmark").removeClass("fa-bookmark-o")
            }
        })

    }
}