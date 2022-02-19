## 사용된 라이브러리 & 데이터베이스
* NestJS
* typeORM
* MySQL

## 설치 및 실행
> ⚠️ Nest가 부팅될 때 지정된 데이터베이스가 초기화됩니다.

NestJS 부팅 시, typeORM이 Database DROP 후 동기화를 진행하는 관계로 다음 순서에 따라 진행해주시기 바랍니다.

1. npm package 설치
```bash
$ npm install
```
2. 프로젝트 루트의 .env 설정 (데이터베이스 연결 설정값)
3. mysql 서비스 시작
4. NestJS 실행
```bash
$ npm start
```
5. SQL 쿼리로 키워드 테이블 세팅
```sql
-- writer(작성자), content(키워드) 입니다.
INSERT INTO keyword (`writer`, `content`) VALUES
  ('receiver_1', 'teapot'),
  ('receiver_1', 'coffee'),
  ('receiver_2', 'coke');
  
```

3000번 포트로 통신하며, 루트 경로에서 Swagger API 페이지를 확인할 수 있습니다.

> 키워드 알림 메소드가 호출될 때 터미널에 로그가 출력됩니다.

## Test
> ⚠️ Test suite이 순차적으로 실행될 때마다 데이터베이스가 초기화됩니다.

```bash
# unit tests
$ npm run test
```
