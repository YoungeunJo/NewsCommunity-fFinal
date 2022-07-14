history.scrollRestoration = "manual"

$(document).ready(function () {
    getList();
});

function toggleWriting() {
    let getToken = localStorage.getItem('IllllIlIII_hid');
    if (getToken == null){
        alert('작성은 로그인 후 가능합니다')
    } else {
        $("#sumbit_toggle").toggle();
        $("#input_text").val('');
        $("#input_name").val('');
        $("#input_title").val('');
    }
}

function toggleMyId(num) {
    let buildID = '#contentsbox-' + num;
    $(buildID).toggle();
}

function submitContent() {
    let newTitle = $("#input_title").val();
    let newText = $("#input_text").val();
    let newEmail = $("#input_email").val();

    let data = {"post_title": newTitle, "post_content": newText, "post_email": newEmail};
    let regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

    if (regEmail.test(newEmail) !== true) {
        return alert('이메일이 형식에 맞지 않습니다');
    }

    let removeSpaceTitle = newTitle.replace(/\s/g,"")
    let removeSpaceText = newTitle.replace(/\s/g,"")

    if (removeSpaceTitle.length !== 0 && removeSpaceText.length !== 0) {

        $.ajax({
            type: "POST",
            url: `/api/user/supports/`,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                toggleWriting();
                alert('등록이 완료되었습니다');
                getList()
            }
        });
    }else{
        alert('빠진 곳이 없는지 확인해주세요!\n전부 입력해주셔야 등록이 가능합니다');
    }
}

function editContent(contentIdx, countedTime) {
    let getToken = localStorage.getItem('IllllIlIII_hid');
    let setContentsID = '#contents-' + contentIdx;
    let edit_btnID = '#edit_btn-' + contentIdx;
    let setUsername = '#username-' + contentIdx;
    let getUsername = $(setUsername).text();


    if(getToken==getUsername){
        if ($(edit_btnID).html() == "수정") { //수정 시작
            if (countedTime>=1800){
                alert('일정 시간이 경과하여 수정이 불가합니다.')
            }else{
                alert('수정을 시작합니다');
                $(setContentsID).attr("readonly", false);
                $(edit_btnID).html('저장');
            }
        } else  {
            $(edit_btnID).html('저장');
            $(edit_btnID).html('수정'); //저장 버튼 클릭 => 수정으로 글씨 변경 및 서버 전송
            $(setContentsID).attr("readonly", true);
            let contents = $(setContentsID).val();
            let data = {"post_content": contents};
            console.log(data)
            $.ajax({
                type: "PUT",
                url: `/api/user/supports/${contentIdx}`,
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (response) {
                    alert('수정 완료되었습니다.');
                }
            });
        }
    }else{
        alert("권한이 없습니다.")
    }
}

function deleteContent(contentIdx,countedTime){
    let getToken = localStorage.getItem('IllllIlIII_hid');
    let setUsername = '#username-' + contentIdx;
    let getUsername = $(setUsername).text();
    if(getToken==getUsername){
        if (countedTime>=1800) {
            alert('일정 시간이 경과하여 삭제가 불가합니다.')
        }else{
            $.ajax({
                type: "DELETE",
                url: `/api/user/supports/${contentIdx}`,
                contentType: "application/json",
                success: function (response) {
                    getList();
                    alert("삭제 완료되었습니다.")
                }
            });
        }
    }else{
        alert("권한이 없습니다.")
    }
}

let defaultURLforGetList = '/api/supports'
function convertList(){
    let currentUrl = defaultURLforGetList;
    let urlForAll = '/api/supports';
    let urlForMe = '/api/user/supports/mine';
    if(currentUrl === urlForAll){
        currentUrl = urlForMe;
        $('.onlymine_btn').html("전체 게시물 확인하기");
    }
    else if(currentUrl === urlForMe){
        currentUrl = urlForAll;
        $('.onlymine_btn').html("내가 쓴 게시글만 확인하기");
    }
    defaultURLforGetList = currentUrl;
    getList()
}


function getList() {
    let getToken = localStorage.getItem('IllllIlIII_hid');
    if (getToken != null){
        $('.onlymine_btn').show();
    }else {
        $('.onlymine_btn').hide();
    }
    $.ajax({
        url: defaultURLforGetList,
        type: 'GET',
        success: function (result) {
            if(result.length != 0){ $('#table_body').empty();}

            for (let i = 0; i < result.length; i++) {
                let getUsername = result[i]["username"];
                let getTitle = result[i]["post_title"];
                let getContent = result[i]["post_content"];
                let idx = result[i]["id"];

                let getCreatedAt = result[i]["created_at"];
                let calculatedTime = timeCalculate(getCreatedAt);
                let createdYYMMDD = getCreatedAt.slice(0, 10);
                let createdWithTime = getCreatedAt.slice(0, 10) + ' ' + getCreatedAt.slice(11, 19);

                let myhtml = `
                            <tr class="tr_title" onclick="toggleMyId(${idx})">
                                <th scope="row">${idx}</th>
                                <td class="name">${getTitle}</td>
                                <td id="username-${idx}">${getUsername}</td>
                                <td>${createdYYMMDD}</td>
                            </tr>
                            <tr id="contentsbox-${idx}" class="content_box" style="display: none;">
                                <td colspan = "4" style="background-color: lightgray; padding: 30px 50px;">
                                    <div >
                                        <div class="content_btn_div" style="display: flex; justify-items: right;">
                                            <div class="content_btn_sub_div" style="margin-left: auto; padding-bottom: 10px;">
                                                <button onclick="deleteContent(${idx}, ${calculatedTime})" type="button" class="submit_btn btn btn-light">게시글 삭제하기</button>
                                            </div>
                                        </div>
                                        <div class="input-group mb-3" >
                                            <span class="input-group-text" style="background-color: #f7f7f7">작성 시각</span>
                                            <span class="form-control" style="background-color: white; text-align: left;">${createdWithTime}</span>
                                        </div>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text" style="background-color: #f7f7f7">작성 내용</span>
                                            <span class="form-control" style="background-color: white">
                                                <textarea id="contents-${idx}" style="border: none;" readonly class="form-control readmodify_textarea">${getContent}</textarea>
                                            </span>
                                        </div>

                                        <div class="content_btn_div" style="display: flex; justify-items: right;">
                                            <div class="content_btn_sub_div" style="margin-left: auto;">
                                                <button onclick="editContent(${idx}, ${calculatedTime})" id ="edit_btn-${idx}"type="button" class="btn btn-light">수정</button>
                                                <button onclick="toggleMyId(${idx})" type="button" class="submit_btn btn btn-light">닫기</button>
                                            </div>
                                        </div>


                                    </div>
                                </td>
                            </tr>;`
                $('#table_body').append(myhtml);
            }

        },
        error: function (e) {
            console.log(e);
        }
    });

}