from models.project_model import Project, UserProject
from flask_login import current_user, login_required
from flask import Blueprint, render_template, request, redirect, url_for, flash, session,jsonify
from controllers.userstory_controller import show_stories, create_story, update_story, delete_story
from controllers.notlist_controller import create_keywords, delete_keyword, show_notlist 
from controllers.alert_controller import get_project_name, save_alert, get_alerts

userstory_bp = Blueprint('userstory', __name__)

# 유저스토리 목록 보기
@userstory_bp.route('/<int:project_id>', methods=['GET'])
@login_required 
def view_stories_route(project_id):
    stories = show_stories(project_id)
    not_list = show_notlist(project_id)
    if isinstance(stories, tuple):
        return stories
    
    if isinstance(not_list, tuple):
        return not_list
   
    keyword_list = [keyword.keyword for keyword in not_list]

    # 플래시 메시지를 한 번만 표시하고 세션에서 제거
    messages = session.get('_flashes', [])
    session['_flashes'] = []

    return render_template(
        'userstory.html', 
        project=Project.find_by_id(project_id), 
        userproject=UserProject.find_by_user_and_project(current_user.id, project_id), 
        stories=stories, 
        not_list=not_list,
        keyword_list=keyword_list,
        # messages=session.get('_flashes', [])  # 빈 리스트로 대체하여 에러 방지
        messages=messages
    )

# 유저스토리 작성
@userstory_bp.route('/<int:project_id>', methods=['POST'])
def create_story_route(project_id):
    content = request.form.get('content')
    create_story(content, project_id)
    
    return redirect(url_for('userstory.view_stories_route', project_id=project_id))

# 유저스토리 수정
@userstory_bp.route('/<int:project_id>/<int:story_id>', methods=['POST'])
def update_story_route(project_id, story_id):
    content = request.form.get('content')
    
    # update_story 함수 호출 및 결과 확인
    result = update_story(story_id, content)
    
    if isinstance(result, str):  # 반환값이 문자열인 경우, 오류 메시지로 처리
        flash(result, "error")
    else:
        flash("유저스토리가 성공적으로 수정되었습니다.", "success")
    
    return redirect(url_for('userstory.view_stories_route', project_id=project_id))

# 유저스토리 삭제
@userstory_bp.route('/<int:project_id>/<int:story_id>/delete', methods=['POST'])
def delete_story_route(project_id, story_id):
    error_message = delete_story(story_id)
    if error_message:
        flash(error_message, "error")
    else:
        flash("유저스토리가 성공적으로 삭제되었습니다.", "success")
    return redirect(url_for('userstory.view_stories_route', project_id=project_id))


# 키워드 추가 라우트
@userstory_bp.route('/notlist/<int:project_id>', methods=['POST'])
def create_keywords_route(project_id):
    keyword = request.form.get('keyword')  # form 데이터로부터 키워드 받기
    
    if not keyword:
        return jsonify({"error": "Keyword missing"}), 400
    
    # 키워드 저장 함수 호출 (데이터베이스에 저장)
    result = create_keywords(keyword, project_id)

    if isinstance(result, tuple):
        return jsonify({"error": result[0]}), result[1]

    # 저장된 키워드를 반환 (클라이언트에 보여줄 데이터)
    return redirect(url_for('userstory.view_stories_route', project_id=project_id))

# 키워드 삭제 라우트
@userstory_bp.route('/notlist/<int:project_id>/<int:not_list_id>/delete', methods=['POST'])
def delete_keyword_route(project_id, not_list_id):
    error_message = delete_keyword(not_list_id)
    
    if error_message:
        flash(error_message, "error")
    else:
        flash("키워드가 성공적으로 삭제되었습니다.", "success")
    
    return redirect(url_for('userstory.view_stories_route', project_id=project_id))

# 확인 버튼 누르면 알림 저장
@userstory_bp.route('/alert/save_alert_to_db', methods=['POST'])
def save_alert_to_db():
    data = request.json    
    project_id = data.get('project_id')
    if not project_id:
        return jsonify({"status": "error", "message": "Project ID is missing"}), 400
    
    message = request.json.get('message')

    
    # 프로젝트 이름을 조회합니다.
    project_name = get_project_name(project_id)
    
    full_alert = f" 프로젝트[{project_name}] : 해당 프로젝트에 {message}"
    
    # 메시지를 데이터베이스에 저장합니다.
    save_alert(project_id, full_alert)

    return jsonify({"status": "success", "message": "Message sent to PM"})

# 메시지 조회
@userstory_bp.route('/get_alerts/<int:project_id>', methods=['GET'])
def get_messages(project_id):
    alerts = get_alerts(project_id)
    return jsonify(alerts)
    