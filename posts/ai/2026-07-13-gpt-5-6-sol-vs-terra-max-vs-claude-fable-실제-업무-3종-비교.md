---
title: 'GPT-5.6 Sol vs Terra Max vs Claude Fable: 실제 업무 3종 비교'
slug: gpt-5-6-sol-vs-terra-max-vs-claude-fable-실제-업무-3종-비교
type: ai
status: publish
labels:
  - AI모델
  - 모델비교
  - GPT
  - Claude
  - 벤치마크
blogger_post_id: '4193476727199204968'
published_at: '2026-07-13T03:21:51-07:00'
updated_at: '2026-07-13T03:21:51-07:00'
---
> 데이터 분석, NPL 설계, 웹 기능 구현이라는 서로 다른 업무를 같은 조건으로 비교해 봤다.
> 이번 테스트는 **GPT-5.6 Sol은 Medium**, **GPT-5.6 Terra는 Max**, **Claude Fable은 중간 단계 설정**으로 진행했다.

<div style="margin:22px 0;padding:18px 20px;border-radius:14px;background:#fbfaf7;border:1px solid #ece9e2;border-left:4px solid #94a3b8;">
<div style="font-weight:800;color:#334155;font-size:15px;margin-bottom:10px;">🧭 왜 이 비교를 했나</div>
<p style="margin:0 0 10px;color:#3f4658;font-size:14.5px;line-height:1.75;">사실 이 테스트는 순수한 궁금증보다 <b>내 작업 방식을 검증하려는 목적</b>이 더 컸다. 나는 요즘 <b>개발은 Claude, 데이터 분석은 Codex(GPT 계열)</b>로 나눠서 쓰고 있다. 특별한 근거가 있었다기보다 "코드는 Claude가 깔끔하고, 분석은 GPT가 꼼꼼하더라"는 경험적 감각으로 굳어진 조합이었다.</p>
<p style="margin:0;color:#3f4658;font-size:14.5px;line-height:1.75;">그런데 이게 정말 맞는 선택인지, 아니면 그냥 익숙해진 습관인지 확신이 서지 않았다. 그래서 실무에 가까운 3종 과제로 같은 조건에서 비교해, <b>이 역할 분담에 근거가 있는지 직접 확인</b>해보기로 했다. 아래 결과가 그 감각과 얼마나 맞는지 하나씩 짚어본다.</p>
</div>

<div style="margin:22px 0;padding:20px 22px;border-radius:16px;background:linear-gradient(135deg,#f5f9ff,#f1fbf6);border:1px solid #e6ebf2;">
<div style="font-weight:800;color:#1f2937;font-size:15px;margin-bottom:14px;">🏁 한눈에 보기</div>
<div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:#334155;line-height:1.55;">
<div style="display:flex;align-items:flex-start;gap:10px;"><span style="flex:none;margin-top:5px;width:10px;height:10px;border-radius:50%;background:#2a78d6;"></span><span><b style="color:#1a56a8;">GPT-5.6 Sol</b> — 가장 깊고 안전. 복잡한 원인 분석·리스크 검증·NPL 설계에서 최강.</span></div>
<div style="display:flex;align-items:flex-start;gap:10px;"><span style="flex:none;margin-top:5px;width:10px;height:10px;border-radius:50%;background:#1baf7a;"></span><span><b style="color:#12805a;">GPT-5.6 Terra Max</b> — 거의 같은 품질을 더 경제적으로. 일반 분석·SQL·문서의 기본값.</span></div>
<div style="display:flex;align-items:flex-start;gap:10px;"><span style="flex:none;margin-top:5px;width:10px;height:10px;border-radius:50%;background:#eda100;"></span><span><b style="color:#8a6200;">Claude Fable</b> — 기존 코드에 적은 수정으로 빠르게. 프론트 구현·프로토타이핑에 강점.</span></div>
</div>
</div>

## 왜 설정을 다르게 했나

세 모델의 기본 성능과 포지션이 동일하지 않기 때문이다.

- **GPT-5.6 Sol (Medium)**
  기본 성능이 가장 높은 상위 모델이므로 Medium 설정만으로도 충분한 성능을 낼 수 있다고 판단했다.

- **GPT-5.6 Terra (Max)**
  Sol보다 기본 모델 성능이 낮기 때문에, 실제 업무에서 사용할 만한 최대 성능을 보기 위해 Max 설정을 사용했다.

- **Claude Fable (중간 단계)**
  지나치게 긴 추론이나 최고 설정이 아니라, 일반적인 실무 사용 환경에 가까운 중간 단계로 비교했다.

따라서 이 테스트는 동일한 추론 단계끼리의 순수 모델 비교라기보다, **각 모델을 실제로 사용할 때 현실적으로 선택할 법한 설정 조합**을 비교한 것이다.

---

## 테스트 개요

세 모델에 동일한 프롬프트를 입력하고 다음 3개 업무를 수행하게 했다.

1. **데이터 분석**
   은행연계 대출의 조회 증가, 실행 정체, 승인율 상승, 낮은 신규 불량률을 해석하고 추가 분석 방향을 도출

2. **NPL 설계 및 SQL**
   매주 상품별 NPL 금액을 전월 말 기준으로 산출하는 업무 로직, 데이터 구조, SQL, 품질 검증 설계

3. **웹 기능 구현**
   FastAPI + React + PostgreSQL 환경에서 CSV 업로드, 검증, 저장, 오류 표시 기능 구현

채점 기준은 단순히 답변이 길거나 코드가 많은지를 보지 않았다.

- 사실과 가설을 제대로 분리했는가
- 검증 가능한 분석 구조를 제시했는가
- SQL과 데이터 모델이 타당한가
- 트랜잭션과 동시성을 고려했는가
- 실제 프로젝트에 적용하기 쉬운가
- 수정량이 과도하지 않은가

상황 3의 코드는 실제 실행하지 않고 정적으로 검토했다. 따라서 실행 가능성 평가는 상대적으로 불확실성이 높다.

---

## 최종 점수

| 상황 | GPT-5.6 Sol Medium | GPT-5.6 Terra Max | Claude Fable |
|---|---:|---:|---:|
| 상황 1 · 데이터 분석 | **91** | 90 | 84 |
| 상황 2 · NPL 설계·SQL | **98** | 94 | 86 |
| 상황 3 · 코딩 | 89 | 91 | **92** |
| **평균** | **92.7** | **91.7** | **87.3** |

<div style="margin:24px 0;padding:22px 22px 16px;border:1px solid #eceef1;border-radius:16px;background:#fff;box-shadow:0 6px 22px rgba(16,24,40,.07);overflow-x:auto;">
<div style="font-weight:800;color:#1f2937;font-size:15px;">📊 상황별 총점 비교</div>
<div style="font-size:12px;color:#98a2b3;margin:2px 0 16px;">100점 만점 · y축 80점부터 표시 · 막대 위 숫자는 실제 점수</div>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
<span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:#f4f7fb;font-size:12px;color:#334155;font-weight:600;"><span style="width:10px;height:10px;border-radius:50%;background:#2a78d6;"></span>GPT-5.6 Sol (Medium)</span>
<span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:#f1faf5;font-size:12px;color:#334155;font-weight:600;"><span style="width:10px;height:10px;border-radius:50%;background:#1baf7a;"></span>GPT-5.6 Terra (Max)</span>
<span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:#fdf8ec;font-size:12px;color:#334155;font-weight:600;"><span style="width:10px;height:10px;border-radius:50%;background:#eda100;"></span>Claude Fable</span>
</div>
<div style="display:flex;align-items:flex-start;gap:8px;min-width:470px;">
<div style="display:flex;flex-direction:column;justify-content:space-between;height:200px;font-size:11px;color:#b6bcc7;text-align:right;width:22px;"><span>100</span><span>95</span><span>90</span><span>85</span><span>80</span></div>
<div style="flex:1;display:flex;justify-content:space-around;align-items:flex-start;gap:22px;">
<div style="display:flex;flex-direction:column;align-items:center;">
<div style="display:flex;align-items:flex-end;gap:9px;height:200px;padding:0 10px;background:repeating-linear-gradient(to top,#eef1f5 0 1px,transparent 1px 50px);border-bottom:2px solid #cbd2dc;">
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1a56a8;margin-bottom:5px;line-height:1;padding:2px 7px;border-radius:6px;background:#eaf3fd;">91</span><div style="width:30px;height:110px;background:linear-gradient(180deg,#5a9ae6,#2a78d6);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(42,120,214,.28);"></div></div>
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1f2937;margin-bottom:5px;line-height:1;">90</span><div style="width:30px;height:100px;background:linear-gradient(180deg,#43c99a,#1baf7a);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(27,175,122,.28);"></div></div>
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1f2937;margin-bottom:5px;line-height:1;">84</span><div style="width:30px;height:40px;background:linear-gradient(180deg,#f5c14a,#eda100);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(237,161,0,.28);"></div></div>
</div>
<div style="font-size:12.5px;color:#475467;margin-top:10px;font-weight:600;">상황 1 · 분석</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;">
<div style="display:flex;align-items:flex-end;gap:9px;height:200px;padding:0 10px;background:repeating-linear-gradient(to top,#eef1f5 0 1px,transparent 1px 50px);border-bottom:2px solid #cbd2dc;">
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1a56a8;margin-bottom:5px;line-height:1;padding:2px 7px;border-radius:6px;background:#eaf3fd;">98</span><div style="width:30px;height:180px;background:linear-gradient(180deg,#5a9ae6,#2a78d6);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(42,120,214,.28);"></div></div>
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1f2937;margin-bottom:5px;line-height:1;">94</span><div style="width:30px;height:140px;background:linear-gradient(180deg,#43c99a,#1baf7a);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(27,175,122,.28);"></div></div>
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1f2937;margin-bottom:5px;line-height:1;">86</span><div style="width:30px;height:60px;background:linear-gradient(180deg,#f5c14a,#eda100);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(237,161,0,.28);"></div></div>
</div>
<div style="font-size:12.5px;color:#475467;margin-top:10px;font-weight:600;">상황 2 · NPL 설계</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;">
<div style="display:flex;align-items:flex-end;gap:9px;height:200px;padding:0 10px;background:repeating-linear-gradient(to top,#eef1f5 0 1px,transparent 1px 50px);border-bottom:2px solid #cbd2dc;">
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1f2937;margin-bottom:5px;line-height:1;">89</span><div style="width:30px;height:90px;background:linear-gradient(180deg,#5a9ae6,#2a78d6);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(42,120,214,.28);"></div></div>
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#1f2937;margin-bottom:5px;line-height:1;">91</span><div style="width:30px;height:110px;background:linear-gradient(180deg,#43c99a,#1baf7a);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(27,175,122,.28);"></div></div>
<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><span style="font-size:13px;font-weight:800;color:#9a6a00;margin-bottom:5px;line-height:1;padding:2px 7px;border-radius:6px;background:#fdf3dd;">92</span><div style="width:30px;height:120px;background:linear-gradient(180deg,#f5c14a,#eda100);border-radius:5px 5px 0 0;box-shadow:0 2px 6px rgba(237,161,0,.28);"></div></div>
</div>
<div style="font-size:12.5px;color:#475467;margin-top:10px;font-weight:600;">상황 3 · 코딩</div>
</div>
</div>
</div>
<div style="font-size:11px;color:#aeb4bf;margin-top:14px;text-align:right;">색 배경 숫자 = 각 상황 1위</div>
</div>

전체 평균만 보면 Sol이 1위다. 그러나 실제 모델 선택에서는 평균 점수보다 **업무별 강점 차이**가 더 중요했다.

---

# 상황 1: 데이터 분석

## 과제

은행연계 대출 조회 건수는 크게 증가했지만 실행 건수와 실행 금액은 소폭 증가했다. 승인율은 상승했고 신규 불량률은 낮았다. 동시에 1금융권의 투자 목적 대출 규제가 강화된 상황이었다.

모델에는 다음을 요구했다.

- 확실한 사실과 가설 구분
- 고객·채널·상품·심사정책·외부환경별 원인 가설
- 가설별 확인 데이터와 지표
- 우선순위가 높은 추가 분석
- 분석 결과에 따른 실행 전략
- 반대 가설과 잘못 해석할 위험

## 결과

| 모델 | 점수 |
|---|---:|
| GPT-5.6 Sol Medium | **91** |
| GPT-5.6 Terra Max | 90 |
| Claude Fable | 84 |

## GPT-5.6 Sol Medium

Sol은 세 모델 중 가설의 폭과 검증 구조가 가장 넓었다.

특히 다음과 같은 해석 오류를 먼저 막았다.

- 조회 증가가 반드시 실제 대출 수요 증가를 뜻하지는 않는다.
- 승인율 상승이 반드시 심사 완화를 의미하지 않는다.
- 신규 불량률이 낮더라도 관찰기간이 짧으면 안전하다고 볼 수 없다.
- 조회와 실행이 동일 코호트가 아니면 조회→실행 전환율 하락을 확정할 수 없다.

고객, 채널, 상품, 심사정책, 외부환경을 세분화하고 각 가설에 필요한 데이터를 연결한 점이 가장 강했다.

다만 가설 수가 많고 설명이 길어, 실제 보고서에 바로 사용하려면 압축이 필요했다.

## GPT-5.6 Terra Max

Terra는 Sol보다 가설의 폭은 조금 좁았지만 실무적인 우선순위가 명확했다.

특히 다음 흐름이 좋았다.

1. 퍼널과 코호트 정의 확인
2. 순고객 수와 반복 조회 분리
3. 승인 이후 병목 구간 확인
4. 고객·상품·채널 믹스 분해
5. 규제 영향군과 비영향군 비교
6. 결과에 따라 실행전략 연결

Sol과 점수 차이가 1점에 불과했다. 일상적인 분석 업무에서는 Terra Max만으로도 충분한 수준이었다.

## Claude Fable

Fable은 답변이 간결하고 일부 관점은 매우 날카로웠다.

예를 들어 다음과 같은 해석은 인상적이었다.

- 현재 좋은 지표가 미래 위험의 전조일 수 있다.
- 고객이 원하는 금액과 승인한도의 차이가 실행 포기의 원인일 수 있다.
- 경쟁사 대비 조건이 "조회할 만하지만 실행할 정도는 아닌" 수준일 수 있다.

하지만 초반에 조회→실행 전환율 하락과 평균 실행금액 하락을 확실한 사실처럼 표현한 부분은 엄밀하지 않았다. 동일 코호트와 정확한 증가율이 없기 때문이다.

### 상황 1 결론

데이터에서 원인을 추론하고, 사용자가 떠올리지 못한 가설과 검증 방법을 확장하는 업무에서는 GPT 계열이 우세했다.

<div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;">
<span style="padding:6px 13px;border-radius:999px;background:#eff5fd;color:#1a56a8;font-size:13px;font-weight:600;">🥇 가장 깊은 분석 · Sol</span>
<span style="padding:6px 13px;border-radius:999px;background:#ecfbf4;color:#12805a;font-size:13px;font-weight:600;">가장 실용적 · Terra Max</span>
<span style="padding:6px 13px;border-radius:999px;background:#fef7e6;color:#8a6200;font-size:13px;font-weight:600;">간결하고 날카로운 관점 · Fable</span>
</div>

---

# 상황 2: NPL 설계와 SQL

## 과제

매주 상품별 NPL 금액을 전월 말 기준으로 산출하는 업무를 설계했다.

예를 들어 7월 7일, 7월 14일, 7월 21일 보고서 모두 6월 30일 기준 NPL 금액을 사용한다. 8월 첫 보고서부터 7월 31일 기준으로 변경한다.

모델에는 다음을 요구했다.

- 기준일과 보고일의 관계
- NPL 정의별 차이
- 필요한 원천 데이터
- 신규 유입, 정상 복귀, 상각, 매각 처리
- 월중 변화와 월말 스냅샷 구분
- SQL 의사코드
- 데이터 품질 검증
- 장점과 한계

## 결과

| 모델 | 점수 |
|---|---:|
| GPT-5.6 Sol Medium | **98** |
| GPT-5.6 Terra Max | 94 |
| Claude Fable | 86 |

## GPT-5.6 Sol Medium

Sol은 기준일, 데이터 적재일, 스냅샷일, 마감일을 명확하게 분리했다.

또한 NPL 금액을 하나로 단정하지 않고 다음과 같이 구분했다.

- 미상환 원금
- 총장부금액
- 총 익스포저
- 충당금 차감 후 순 NPL

SQL도 가장 상세했다.

- 보고일에서 전월 말 기준일 계산
- 확정된 최신 스냅샷 버전 선택
- 기준일 시점 상품 마스터 조인
- 상품별 원금·총 익스포저·충당금·순 익스포저 집계
- 스냅샷이 없을 때 이력 테이블에서 기준일 최종 상태 복원
- 재마감과 정정 이력 관리

특히 **스냅샷 테이블이 없는 경우를 고려한 대체 SQL**까지 제시한 점이 차별점이었다.

## GPT-5.6 Terra Max

Terra 역시 상당히 완성도가 높았다.

좋았던 부분은 NPL 정의를 다섯 축으로 정리한 것이다.

- 판정 기준
- 금액 기준
- 분류 단위
- 보고 범위
- 상품 귀속 기준

또한 공식 월말 NPL, 주간 현재 NPL, 월중 이동 내역을 분리했다.

| 구분 | 기준일 | 용도 |
|---|---|---|
| 공식 상품별 NPL | 전월 말 | 결산·리스크 보고 |
| 주간 현재 NPL | 해당 주말 또는 전영업일 | 조기경보 |
| NPL 이동 내역 | 월초~보고일 | 변동 원인 설명 |

SQL도 PostgreSQL 기준으로 충분히 현실적이었다.

다만 동일 기준일에 여러 FINAL 버전이 존재할 때 최신 공식 버전을 하나만 선택하는 로직은 Sol보다 약했다.

## Claude Fable

Fable은 답변 시작부터 "SQL보다 먼저 NPL 정의를 확정해야 한다"고 명시했다. 업무 정의 관점에서는 매우 적절했다.

또한 다음 차이를 분명하게 설명했다.

- 90일 이상 연체와 고정 이하 자산 분류
- 원금 기준과 총장부금액 기준
- 기준일 상품과 현재 상품
- 잠정치와 확정치
- 월중 변화와 공식 월말 스냅샷

다만 SQL과 데이터 구조는 Sol과 Terra보다 단순했다.

- 재마감 버전 선택
- 상품 마스터 SCD 조인
- 복수 통화
- 스냅샷 통제
- 확정 집계 테이블

같은 세부 설계가 상대적으로 부족했다.

### 상황 2 결론

정의, 데이터 구조, SQL, 운영 통제까지 연결하는 업무에서는 Sol이 가장 강했다. Terra Max도 대부분의 실무에서 충분했지만, 복잡한 예외 처리와 재현성 통제에서는 Sol이 한 단계 앞섰다.

<div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;">
<span style="padding:6px 13px;border-radius:999px;background:#eff5fd;color:#1a56a8;font-size:13px;font-weight:600;">🥇 가장 완전한 설계 · Sol</span>
<span style="padding:6px 13px;border-radius:999px;background:#ecfbf4;color:#12805a;font-size:13px;font-weight:600;">견고하고 더 간결 · Terra Max</span>
<span style="padding:6px 13px;border-radius:999px;background:#fef7e6;color:#8a6200;font-size:13px;font-weight:600;">업무 정의 설명 · Fable</span>
</div>

---

# 상황 3: FastAPI + React 코딩

## 과제

FastAPI, React, PostgreSQL 프로젝트에 CSV 업로드 기능을 추가했다.

요구사항은 다음과 같았다.

- CSV 업로드
- 필수 컬럼 검증
- `query_id` 중복 방지
- HTTP/HTTPS URL 검증
- 오류 행 미저장
- 정상 행 저장
- 성공·실패 건수와 오류 목록 반환
- 프론트에서 진행 상태와 오류 테이블 표시
- 동일 파일 재업로드 정책
- 대용량 파일과 트랜잭션 실패 고려

## 결과

| 모델 | 점수 |
|---|---:|
| Claude Fable | **92** |
| GPT-5.6 Terra Max | 91 |
| GPT-5.6 Sol Medium | 89 |

상황 3은 가장 접전이었다. 순수 완성도만 보면 Terra가 가장 강했지만, 채점 기준에 **기존 프로젝트에 적용할 때 수정량이 적은 답변을 높게 평가한다**는 조건이 있었기 때문에 Fable이 근소하게 1위를 차지했다.

## Claude Fable

Fable의 강점은 핵심 기능을 비교적 적은 파일과 코드로 구현했다는 점이다.

- 기존 모델과 DB 세션 재사용
- 정상 행 단일 트랜잭션 저장
- `ON CONFLICT DO NOTHING RETURNING`을 통한 race-safe 중복 처리
- 필요한 코드와 생략 가능한 부분 구분
- 동시성·롤백을 포함한 테스트 시나리오
- 프론트 업로드 진행률 구현

즉 가장 화려하거나 기능이 많은 답변은 아니었지만, 기존 프로젝트에 붙이기 쉬운 구조였다.

다만 URL 검증을 정규식으로 처리한 점, 대용량 데이터를 행별로 삽입한 점, 인코딩 fallback 정책은 보완이 필요했다.

## GPT-5.6 Terra Max

Terra는 가장 프로덕션 지향적인 구조를 제시했다.

- 파일 SHA-256 기반 멱등성
- 업로드 이력 테이블
- 오류 전용 테이블
- 오류 페이지네이션 API
- 처리 상태 관리
- 동시성 충돌 처리
- 대용량 파일 제한
- CSV Formula Injection 고려
- 향후 `COPY FROM` 기반 벌크 처리 전환

기능 완성도와 운영 견고성은 가장 높았다.

그러나 단순 내부 기능에 적용하기에는 구조가 과도하게 커질 수 있었다. 기존 프로젝트에 반영해야 할 파일과 테이블이 많아 적용 용이성에서 감점됐다.

## GPT-5.6 Sol Medium

Sol은 Terra와 Fable의 중간에 가까웠다.

- 파일 내부 중복과 DB 중복 분리
- `ON CONFLICT DO NOTHING` 기반 동시성 처리
- UTF-8 BOM 지원
- 중복 헤더와 CSV 구조 오류 처리
- 실패 행 기준의 정확한 카운트
- 실제 바이트 기반 업로드 진행률
- 구체적인 테스트 케이스

백엔드, 프론트, 테스트의 균형은 좋았지만, Terra만큼 운영 구조가 깊지는 않았고 Fable만큼 수정량이 적지도 않았다.

### 상황 3 결론

개발 업무에서는 "무엇을 잘한다고 볼 것인가"에 따라 순위가 바뀐다.

<div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;">
<span style="padding:6px 13px;border-radius:999px;background:#fef7e6;color:#8a6200;font-size:13px;font-weight:600;">🥇 최소 수정으로 적용 · Fable</span>
<span style="padding:6px 13px;border-radius:999px;background:#ecfbf4;color:#12805a;font-size:13px;font-weight:600;">프로덕션급 전체 설계 · Terra Max</span>
<span style="padding:6px 13px;border-radius:999px;background:#eff5fd;color:#1a56a8;font-size:13px;font-weight:600;">백엔드·프론트·테스트 균형 · Sol</span>
</div>

이번 테스트는 실제 코드베이스를 주고 수정하게 한 것이 아니라, 처음부터 구현안을 작성하게 한 문서형 코딩 테스트다. 따라서 실제 저장소 탐색, 테스트 실행, 반복 디버깅까지 포함하면 결과가 달라질 수 있다.

---

# 모델별 성향 정리

<div style="margin:20px 0;border:1px solid #dfe6f1;border-radius:16px;overflow:hidden;box-shadow:0 3px 12px rgba(16,24,40,.05);">
<div style="background:linear-gradient(135deg,#2a78d6,#1c5fb0);color:#fff;padding:13px 18px;font-weight:800;font-size:15px;">GPT-5.6 Sol (Medium) · 가장 깊고 안전</div>
<div style="padding:2px 18px 16px;">
<p style="color:#475467;font-size:14px;margin:12px 0;">Sol은 가장 깊고 안전한 답변을 냈다.</p>
<div style="font-weight:700;color:#12805a;margin:14px 0 4px;font-size:13px;">✅ 강점</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>사실과 가설 분리</li>
<li>지표 정의와 전제 검증</li>
<li>예외 상황과 반대 가설</li>
<li>데이터 구조와 운영 통제</li>
<li>복잡한 SQL</li>
<li>중요한 업무에서의 안정성</li>
</ul>
<div style="font-weight:700;color:#b45309;margin:14px 0 4px;font-size:13px;">⚠️ 약점</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>답변이 길어질 수 있음</li>
<li>간단한 문제에도 과도하게 확장할 가능성</li>
<li>Terra Max와 차이가 작은 업무에서도 비용이 더 높음</li>
</ul>
<div style="font-weight:700;color:#1a56a8;margin:14px 0 4px;font-size:13px;">🎯 적합한 업무</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>중요한 리스크 분석</li>
<li>복잡한 원인 분석</li>
<li>데이터 기준과 정의가 얽힌 설계</li>
<li>최종 검증</li>
<li>실패 비용이 큰 업무</li>
</ul>
</div>
</div>

<div style="margin:20px 0;border:1px solid #d6ede2;border-radius:16px;overflow:hidden;box-shadow:0 3px 12px rgba(16,24,40,.05);">
<div style="background:linear-gradient(135deg,#1baf7a,#128a5f);color:#fff;padding:13px 18px;font-weight:800;font-size:15px;">GPT-5.6 Terra Max · 가장 가성비 좋음</div>
<div style="padding:2px 18px 16px;">
<p style="color:#475467;font-size:14px;margin:12px 0;">Terra Max는 이번 비교에서 가장 가성비가 좋았다.</p>
<div style="font-weight:700;color:#12805a;margin:14px 0 4px;font-size:13px;">✅ 강점</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>Sol과 비슷한 분석 품질</li>
<li>실무 구조가 명확함</li>
<li>SQL과 데이터 모델링이 강함</li>
<li>프로덕션급 구현 설계</li>
<li>Sol보다 간결한 경우가 많음</li>
</ul>
<div style="font-weight:700;color:#b45309;margin:14px 0 4px;font-size:13px;">⚠️ 약점</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>모호한 문제에서는 Sol보다 가설의 폭이 좁음</li>
<li>매우 복잡한 예외나 재마감 통제는 Sol보다 약할 수 있음</li>
<li>Max 설정이기 때문에 추론 토큰 사용량은 커질 수 있음</li>
</ul>
<div style="font-weight:700;color:#1a56a8;margin:14px 0 4px;font-size:13px;">🎯 적합한 업무</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>일반 데이터 분석</li>
<li>SQL 작성</li>
<li>KPI와 지표 정의</li>
<li>API 및 데이터 파이프라인 설계</li>
<li>일반적인 사내 웹 기능</li>
<li>보고서와 분석 문서</li>
</ul>
</div>
</div>

<div style="margin:20px 0;border:1px solid #f0e2c4;border-radius:16px;overflow:hidden;box-shadow:0 3px 12px rgba(16,24,40,.05);">
<div style="background:linear-gradient(135deg,#c98a00,#a06c00);color:#fff;padding:13px 18px;font-weight:800;font-size:15px;">Claude Fable · 코딩에서 최고점</div>
<div style="padding:2px 18px 16px;">
<p style="color:#475467;font-size:14px;margin:12px 0;">Fable은 전체 평균은 낮았지만 코딩 상황에서 가장 높은 점수를 받았다.</p>
<div style="font-weight:700;color:#12805a;margin:14px 0 4px;font-size:13px;">✅ 강점</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>핵심을 빠르게 구현</li>
<li>기존 프로젝트에 적은 수정으로 적용</li>
<li>코드가 짧고 이해하기 쉬움</li>
<li>일부 엣지케이스와 실무 감각이 날카로움</li>
<li>UI와 기능 구현 방향이 자연스러움</li>
</ul>
<div style="font-weight:700;color:#b45309;margin:14px 0 4px;font-size:13px;">⚠️ 약점</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>분석에서 전제를 성급하게 단정할 수 있음</li>
<li>데이터 구조와 운영 통제가 GPT보다 단순할 수 있음</li>
<li>전체 요구사항을 넓게 커버하기보다 핵심 구현에 집중하는 경향</li>
<li>복잡한 SQL과 데이터 모델 설계에서는 상대적으로 약함</li>
</ul>
<div style="font-weight:700;color:#1a56a8;margin:14px 0 4px;font-size:13px;">🎯 적합한 업무</div>
<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
<li>기존 코드 수정</li>
<li>프론트엔드 기능 구현</li>
<li>비교적 작은 diff가 중요한 작업</li>
<li>빠른 프로토타이핑</li>
<li>명확한 요구사항을 코드로 옮기는 작업</li>
</ul>
</div>
</div>

# 결론

이번 테스트에서 절대 평균 점수는 Sol이 가장 높았다.

| 구분 | 모델 |
|---|---|
| 전체 품질 | **GPT-5.6 Sol Medium** |
| 가성비 | **GPT-5.6 Terra Max** |
| 데이터 분석 | **Sol 또는 Terra Max** |
| NPL·SQL 설계 | **Sol** |
| 최소 수정 중심 개발 | **Claude Fable** |
| 프로덕션급 개발 설계 | **Terra Max** |

가장 현실적인 사용 전략은 다음과 같다.

<div style="margin:18px 0;display:flex;flex-direction:column;gap:10px;">
<div style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:12px;background:#ecfbf4;border-left:4px solid #1baf7a;">
<span style="flex:1;color:#334155;font-size:14px;">일반 데이터 분석 · SQL · 문서 · 설계</span>
<span style="flex:none;font-weight:800;color:#12805a;font-size:14px;">GPT-5.6 Terra Max</span>
</div>
<div style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:12px;background:#eff5fd;border-left:4px solid #2a78d6;">
<span style="flex:1;color:#334155;font-size:14px;">복잡한 원인 분석 · 리스크 검증 · 최종 리뷰</span>
<span style="flex:none;font-weight:800;color:#1a56a8;font-size:14px;">GPT-5.6 Sol Medium</span>
</div>
<div style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:12px;background:#fef7e6;border-left:4px solid #eda100;">
<span style="flex:1;color:#334155;font-size:14px;">기존 코드 수정 · 프론트 구현 · 빠른 기능 추가</span>
<span style="flex:none;font-weight:800;color:#8a6200;font-size:14px;">Claude Fable</span>
</div>
</div>

한 모델이 모든 업무에서 압도적이지는 않았다.

Sol은 가장 깊고 안전했고, Terra Max는 거의 같은 품질을 더 경제적으로 제공했으며, Fable은 기존 코드에 빠르게 적용하는 개발 작업에서 강점을 보였다.

결국 중요한 것은 "어떤 모델이 가장 좋은가"보다 **업무 유형에 따라 어떤 모델을 배치해야 수정 시간과 실패 비용이 줄어드는가**다.

<div style="margin:22px 0;padding:18px 20px;border-radius:14px;background:#f1faf5;border:1px solid #cdeadd;border-left:4px solid #1baf7a;">
<div style="font-weight:800;color:#12805a;font-size:15px;margin-bottom:8px;">✅ 그래서, 내 작업 분담은 맞았을까</div>
<p style="margin:0;color:#33514a;font-size:14.5px;line-height:1.75;">처음 목적으로 돌아가면, 이 결과는 지금의 분담—<b>개발은 Claude, 분석은 GPT(Codex)</b>—에 어느 정도 근거가 있음을 확인해줬다. 분석·설계에서는 GPT 계열이, 기존 코드에 빠르게 붙이는 개발에서는 Claude가 앞섰기 때문이다. 습관이라 여겼던 선택이 실제 모델 성향과 크게 어긋나지 않았다는 점이, 이번 검증에서 개인적으로 가장 큰 수확이었다.</p>
</div>

---

## 테스트의 한계

- 상황 3의 코드는 실제 실행하지 않고 정적으로 검토했다.
- 모델 응답은 실행 시점과 세션에 따라 달라질 수 있다.
- Sol, Terra, Fable의 추론 설정이 동일하지 않다.
- 이번 테스트는 각 모델의 현실적인 사용 조합을 비교한 것이지, 동일 조건의 순수 벤치마크는 아니다.
- 실제 코드베이스 탐색과 반복 디버깅 능력은 별도 테스트가 필요하다.
- 세 문제만으로 모든 업무 영역을 일반화할 수는 없다.

따라서 점수 자체보다, 세 상황에서 반복적으로 나타난 **모델별 작업 성향**을 중심으로 해석하는 것이 적절하다.
