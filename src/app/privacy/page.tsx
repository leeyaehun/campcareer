import Link from "next/link"
import { pageMetadata } from "@/lib/seo"
import { getLocale } from "@/lib/i18n/server"

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How CampCareer collects, stores, and protects account, saved-plan, consent, and product analytics data.",
  path: "/privacy",
})

const LAST_UPDATED = "11 September 2026"

export default async function PrivacyPage() {
  if (await getLocale() === "ko") return <KoreanPrivacyPage />
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-slate-900 tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-8 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">1. Who we are</h2>
          <p>
            CampCareer (&quot;we&quot;, &quot;us&quot;) is operated by Yaehun Lee and provides a study-abroad and
            immigration decision platform at campcareer.com. Yaehun Lee is the controller for the
            personal data described in this policy. This policy explains what personal data we
            collect, why we collect it, and the choices you have. For any privacy question or
            request, contact <a href="mailto:leeyaehun@gmail.com" className="text-blue-600 hover:underline">leeyaehun@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">2. Data we collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account data</strong> — email address and authentication identifiers when
              you create an account or sign in.
            </li>
            <li>
              <strong>Decision inputs</strong> — origin country, study concept, budget, currency,
              and product priority used to calculate or save a decision plan.
            </li>
            <li>
              <strong>Saved plans</strong> — the recommendation snapshot, source and engine
              versions, and recalculation history you explicitly save.
            </li>
            <li>
              <strong>Consent records</strong> — separate records for saving a plan and for any
              optional policy or marketing alerts. Saving a plan does not subscribe you to marketing.
            </li>
            <li>
              <strong>Application-support requests</strong> — your name, account email, selected
              study option, destination, optional intake and budget, requested help, consent time,
              and request status when you ask to be connected with a verified school or agency.
              We do not share this request with a partner until you give the specific consent shown
              in that request form.
            </li>
            <li>
              <strong>Usage analytics</strong> — page views, performance measurements, and
              allow-listed product events collected with Vercel Analytics, Speed Insights, and,
              when configured, Google Analytics 4 after your measurement consent.
              Product events may include origin country, concept ID, destination, and engine/data
              versions, but never email addresses or free-text responses.
            </li>
            <li>
              <strong>Country launch requests</strong> — the destination you request and a
              one-way digest of a browser-generated request identifier so we can deduplicate
              demand signals. We do not collect your email address, IP address, or user-agent
              for this feature.
            </li>
            <li>
              <strong>Feedback reports</strong> — the category and text you submit, plus an email
              address only if you opt in to follow-up. Data-issue reports include the query-free
              page and product context needed to review them. If you separately opt in, we may also
              attach locale, time zone, browser user-agent, and viewport size to help reproduce a
              fault. Uploaded screenshots are stored privately and are not made public or shared
              with partners.
            </li>
            <li>
              <strong>Community contributions</strong> — the contribution type, page or topic,
              text, optional source link, moderation status and reviewer note when you submit a
              review, correction or source suggestion. Approved contributions create a private
              reputation ledger entry. We do not publish your identity or contribution in this
              first release.
            </li>
            <li>
              <strong>Programme completion and portfolio data</strong> — the private snapshot of
              planning records used when you complete a CampCareer programme, and the current
              careers, providers and courses shown in your private portfolio. This is not an
              academic, immigration or employment credential.
            </li>
            <li>
              <strong>Programme evidence links</strong> — programme labels, official source URLs
              and notes you save for your private Verify step. Saving a link does not mean that
              CampCareer, a provider or a regulator has approved it.
            </li>
            <li>
              <strong>Optional measurement and attribution</strong> — after you choose “Allow
              measurement”, we store a short-lived session identifier, first page path, and UTM
              campaign fields to measure product and partner-link performance. We do not create
              these attribution cookies when you choose “Essential only”.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">3. How we store and protect data</h2>
          <p>
            Personal records are stored with our infrastructure providers (see section 4).
            Saved decision plans are protected by owner-only row-level security and are only
            readable by the authenticated account that owns them. Data is encrypted in transit
            and at rest by our providers. Save-intent tokens expire after 24 hours. Saved plans
            are retained while your account remains active or until you request deletion. Feedback
            reports and private screenshots are retained for up to 180 days, unless a longer period
            is necessary to investigate abuse, security, or a legal claim. Optional attribution
            cookies expire after 30 days; measurement-consent choices expire after 180 days.
            Community contribution and reputation records are retained while your account remains
            active and are deleted with your account, unless retention is necessary for abuse,
            security, or a legal claim.
            Programme completion and private portfolio records are also retained while your account
            remains active and are deleted with your account.
            Programme evidence links are retained on the same basis and are deleted with your
            account.
            Historic Australia report-preparation and launch-update records are retained only for
            the applicable deletion period and are not collected for new report sales or launch
            registrations. We do not take payment-card data through these historic records.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">4. Processors and sub-processors</h2>
          <p>We use the following service providers to operate CampCareer:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Supabase</strong> — database and authentication.</li>
            <li><strong>Supabase Storage</strong> — private feedback screenshots when you choose to upload one.</li>
            <li><strong>Vercel</strong> — application hosting and privacy-friendly analytics.</li>
            <li><strong>Google Analytics</strong> — optional product measurement only when a GA4 property is configured and you choose “Allow measurement”.</li>
            <li><strong>Resend</strong> — transactional messages and separately consented alerts.</li>
          </ul>
          <p className="mt-2">
            These providers process data on our behalf under their own data-processing agreements
            and security certifications.
          </p>
          <p className="mt-2">
            If you submit an application-support request, the verified school or agency assigned to
            that request becomes an independent recipient of the information you explicitly agreed
            to share. Sponsored placement never changes comparison or course ranking.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">5. Legal bases and international transfers</h2>
          <p>
            We process account and saved-plan data to provide the service you request; security,
            reliability, and limited product measurement under our legitimate interests where
            permitted; and optional feedback follow-up, partner sharing, alerts, and measurement
            where you give consent. Our providers may process data outside your country. Where
            required, we rely on the provider&apos;s applicable transfer safeguards and data-processing
            terms. Do not submit special-category personal data, passport numbers, passwords, or
            payment-card data in feedback.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">6. Your rights and deletion requests</h2>
          <p>
            Depending on where you live (including under the EU/UK GDPR), you may have the right
            to access, correct, export, or delete your personal data. You can manage your profile
            and delete saved content where the product provides a delete control. You can also
            permanently delete your account in <Link href="/settings" className="text-blue-600 hover:underline">Account settings</Link>.
            For an access, correction, or export request, email{" "}
            <a href="mailto:leeyaehun@gmail.com" className="text-blue-600 hover:underline">leeyaehun@gmail.com</a>{" "}
            from your registered address; we will action verified requests within 30 days. Limited
            feedback and security records may be retained for the periods described in section 3.
            Depending on your location, you may also have the right to complain to your local data
            protection authority.
          </p>
        </section>

        <section id="cookies-and-measurement">
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">7. Cookies and measurement choices</h2>
          <p>
            We use strictly necessary cookies for authentication sessions and interface state.
            Optional product measurement and attribution begin only after you choose “Allow
            measurement” in the privacy control. When configured, Google Analytics 4 and Vercel
            measurement load only after that choice; we do not use third-party advertising cookies.
            Partner links may carry an
            affiliate identifier after you choose to open that partner&apos;s site; the partner&apos;s own
            privacy policy then applies. You can change the measurement choice in Account settings;
            choosing essential functionality only clears CampCareer&apos;s optional measurement cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">8. Children and changes to this policy</h2>
          <p>
            CampCareer is not designed for children under 16. We may update this policy as the
            product evolves. Material changes will be announced on this page with an updated
            &quot;last updated&quot; date.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200 text-sm">
        <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
      </div>
    </div>
  )
}

function KoreanPrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">개인정보 처리방침</h1>
      <p className="mb-10 mt-2 text-sm text-slate-400">최종 업데이트: 2026년 9월 11일</p>
      <div className="space-y-8 text-sm leading-relaxed text-slate-600">
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">1. 운영 주체와 문의</h2><p>CampCareer는 Yaehun Lee가 운영하는 유학·커리어 의사결정 서비스입니다. Yaehun Lee는 이 방침에서 설명하는 개인정보의 처리자입니다. 이 방침은 어떤 정보를 왜 수집하는지와 이용자의 선택권을 설명합니다. 개인정보 관련 문의나 요청은 <a href="mailto:leeyaehun@gmail.com" className="text-blue-600 hover:underline">leeyaehun@gmail.com</a>으로 보내주세요.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">2. 수집하는 정보</h2><ul className="list-disc space-y-1.5 pl-5"><li><strong>계정 정보</strong> — 회원가입·로그인에 필요한 이메일과 인증 식별자</li><li><strong>의사결정 입력값과 저장 계획</strong> — 국가, 전공·직업, 예산, 우선순위, 저장한 후보와 다음 할 일</li><li><strong>선택적 분석 정보</strong> — 측정 허용 시에만 생성되는 짧은 세션 식별자, 첫 방문 경로, UTM 캠페인 값과 허용된 제품 이벤트. 이메일이나 자유 입력 내용은 분석 이벤트에 넣지 않습니다.</li><li><strong>피드백·지원 요청</strong> — 사용자가 직접 제출한 범주, 내용, 후속 연락 동의와 필요한 경우의 비공개 스크린샷입니다. 데이터 오류 신고에는 검토에 필요한 검색어 없는 페이지·제품 문맥을 함께 저장하며, 기술 정보는 별도 동의가 있을 때만 추가합니다.</li></ul><p className="mt-2">여권번호, 비자 서류, 비밀번호, 결제카드 정보, 건강 정보는 피드백에 제출하지 마세요.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">3. 보관·보호·삭제</h2><p>계정과 저장 계획은 계정이 유지되는 동안 보관하며 계정 삭제 시 함께 삭제합니다. 과거 호주 리포트 준비·출시 알림 기록은 해당 삭제 기간 동안에만 보관하며, 새 리포트 판매나 출시 알림 등록에는 수집하지 않습니다. 피드백과 비공개 스크린샷은 원칙적으로 최대 180일 보관합니다. 저장 데이터는 계정 소유자만 읽을 수 있는 접근 통제와 전송·저장 암호화를 적용합니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">4. 처리업체와 제3자</h2><p>서비스 운영을 위해 Supabase(데이터베이스·인증·비공개 저장소), Vercel(호스팅·분석), Resend(거래성 및 동의된 이메일)를 사용합니다. Google Analytics 4를 설정한 경우에도 “측정 허용”을 선택한 뒤에만 제품 측정에 사용합니다. 학교나 에이전시에 지원 도움을 요청한 경우에도, 해당 요청 화면에서 별도 동의한 정보만 파트너에게 공유합니다. 스폰서나 제휴 관계는 비교·순위에 영향을 주지 않습니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">5. 처리 목적과 국제 이전</h2><p>서비스 제공, 보안과 신뢰성 유지, 허용된 제한적 제품 측정에는 계약 이행 또는 정당한 이익을, 이메일 알림·피드백 후속 연락·파트너 공유·선택적 측정에는 동의를 근거로 사용합니다. 서비스 제공업체는 이용자 국가 밖에서 데이터를 처리할 수 있으며, 필요한 경우 해당 제공업체의 데이터 처리·국제 이전 보호조치를 적용합니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">6. 이용자의 권리</h2><p>거주 지역에 따라 열람, 정정, 내보내기, 삭제를 요청할 수 있습니다. 계정은 <Link href="/ko/settings" className="text-blue-600 hover:underline">계정 설정</Link>에서 삭제할 수 있으며, 그 밖의 요청은 등록 이메일 주소에서 <a href="mailto:leeyaehun@gmail.com" className="text-blue-600 hover:underline">leeyaehun@gmail.com</a>으로 보내주세요. 확인된 요청은 원칙적으로 30일 이내 처리합니다.</p></section>
        <section id="cookies-and-measurement"><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">7. 쿠키와 측정 선택</h2><p>인증과 화면 상태에는 필수 쿠키를 사용합니다. 제품 측정·유입 분석은 “측정 허용”을 선택한 뒤에만 시작합니다. 설정된 경우 Google Analytics 4와 Vercel 측정도 이 선택 뒤에만 로드하며, 제3자 광고 쿠키는 사용하지 않습니다. 제휴 링크를 열면 해당 외부 서비스의 개인정보 처리방침이 적용됩니다. 계정 설정에서 언제든 측정 선택을 바꿀 수 있으며, 필수 기능만 사용을 선택하면 CampCareer의 선택형 측정 쿠키를 삭제합니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">8. 아동과 변경 사항</h2><p>CampCareer는 16세 미만 아동을 대상으로 설계되지 않았습니다. 방침을 중요하게 변경하면 이 페이지의 업데이트 날짜와 함께 안내합니다.</p></section>
      </div>
      <div className="mt-12 border-t border-slate-200 pt-6 text-sm"><Link href="/ko/terms" className="text-blue-600 hover:underline">이용약관</Link></div>
    </div>
  )
}
