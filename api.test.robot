*** Settings ***
Library    REST          http://10.3.4.52:3000
*** Test Cases ***
Get homepage: Test if app is running
  GET       /
  Integer   response status                 200

Get bad route: Test for undefined route
  GET       /this/path
  Integer   response status                 404

Get /users/login: Test empty Authorization or invalid username
  GET       /api/users/login
  Integer   response status                 403
  String    response body message           Invalid user.

Get /users/login: Test empty or invalid password
  GET       /api/users/login                headers={"authorization": "Basic YWRtaW46eHh4eHh4eHh4eA=="}
  Integer   response status                 400
  String    response body message           Invalid password.

Get /users/login: Test good password
  GET       /api/users/login                headers={"authorization": "Basic YWRtaW46MTIzNDU2Nzg5MA=="}
  Integer   response status                 200

Get /api/users: Test admin token
  GET       /api/users/login                headers={"authorization": "Basic YWRtaW46MTIzNDU2Nzg5MA=="}
  ${admintoken}=  String                    response body token
  GET       /api/users                      headers={"authorization": "Bearer ${admintoken}[0]"}
  Integer   response status                 200
