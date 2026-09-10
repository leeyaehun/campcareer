import Link from "next/link"
import { pageMetadata } from "@/lib/seo"
import { getLocale } from "@/lib/i18n/server"

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of CampCareer, including the estimated nature of ROI, salary, and visa data.",
  path: "/terms",
})

const LAST_UPDATED = "8 August 2026"

export default async function TermsPage() {
  if (await getLocale() === "ko") return <KoreanTermsPage />
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-slate-900 tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-8 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">1. Acceptance</h2>
          <p>
            By using campcareer.com (&quot;CampCareer&quot;, the &quot;Service&quot;), operated by Yaehun Lee,
            you agree to these terms. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">2. Nature of the data — no advice</h2>
          <p>
            ROI scores, salary figures, tuition costs, tax estimates, payback periods, and visa or
            immigration information shown on CampCareer are source-backed data, estimates, or
            unavailable fields as labelled in the product. They are provided for general information
            only and do not constitute financial, legal, tax, admissions, or immigration advice.
            We do not guarantee admission, employment, sponsorship, visa approval, permanent
            residence, income, or a particular outcome. Always verify critical figures and
            requirements with the official authority and provider before making decisions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">3. Your account and content</h2>
          <p>
            You are responsible for keeping your account credentials secure and for the content
            you submit, including saved-plan inputs, support requests, and optional feedback
            screenshots. You retain ownership of your content; you grant us only the rights needed
            to store, review, secure, and operate the service. You must not submit content that is
            unlawful, confidential to another person, or that you do not have the right to share.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">4. Feedback and external links</h2>
          <p>
            Feedback helps us improve the service but does not create a support obligation or
            transfer ownership of our product. Do not include passwords, passport numbers, payment
            details, or sensitive personal information. Links to official sources, schools, jobs,
            or other third parties are provided for convenience; those sites control their own
            content, availability, and privacy practices.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">5. Partners, referrals, and affiliate links</h2>
          <p>
            CampCareer may show clearly labelled links to verified schools, agencies, insurers,
            money-transfer providers, communications providers, or accommodation services. A
            commercial relationship never changes the ranking or evidence shown in a comparison.
            We only share a support request with a partner after the specific consent shown in that
            request. Any agreement you enter with a partner is directly with that partner.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">6. Retired Australia report records</h2>
          <p>
            CampCareer no longer sells Australia reports, accepts report preparation, or accepts
            report-launch registrations. Historic records are retained or deleted only as described
            in the Privacy Policy. CampCareer does not provide a report purchase, delivery, expert
            review, or automated visa-eligibility service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">7. Acceptable use</h2>
          <p>
            You agree not to abuse the Service — including attempting to access other users&apos;
            data, scraping at volumes that degrade the Service, or interfering with its
            operation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">8. Availability and changes</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. We may
            modify, suspend, or discontinue features at any time. We may update these terms;
            continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, CampCareer is not liable for decisions made in
            reliance on estimated data, or for indirect or consequential damages arising from use
            of the Service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-2">10. Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href="mailto:leeyaehun@gmail.com" className="text-blue-600 hover:underline">leeyaehun@gmail.com</a>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200 text-sm">
        <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
      </div>
    </div>
  )
}

function KoreanTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">이용약관</h1>
      <p className="mb-10 mt-2 text-sm text-slate-400">최종 업데이트: 2026년 8월 8일</p>
      <div className="space-y-8 text-sm leading-relaxed text-slate-600">
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">1. 약관 동의</h2><p>Yaehun Lee가 운영하는 campcareer.com과 CampCareer 서비스를 이용하면 본 약관에 동의하게 됩니다. 동의하지 않으면 서비스를 이용하지 마세요.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">2. 데이터의 성격과 비조언 고지</h2><p>ROI, 연봉, 학비, 세금 추정, 투자회수기간, 비자·이민 정보는 출처 기반 데이터·추정치·미확인 항목으로 표시됩니다. 이는 일반 정보이며 금융·법률·세무·입학·이민 자문이 아닙니다. CampCareer는 입학, 취업, 스폰서십, 비자 승인, 영주권, 소득, 투자수익을 보장하지 않습니다. 중요한 수치와 요건은 반드시 공식 기관과 교육기관에서 확인해야 합니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">3. 계정과 제출 정보</h2><p>이용자는 계정 자격증명과 본인이 제출하는 저장 계획·지원 요청·피드백의 책임을 집니다. 이용자는 자신의 콘텐츠 권리를 보유하며, CampCareer에는 서비스 보관·검토·보안·운영에 필요한 범위의 권한만 부여합니다. 타인의 기밀 정보나 공유 권한이 없는 정보를 제출해서는 안 됩니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">4. 피드백과 외부 링크</h2><p>피드백은 서비스 개선에 사용되지만 지원 의무를 만들지 않습니다. 비밀번호, 여권번호, 결제 정보, 민감한 개인정보를 포함하지 마세요. 공식 출처·학교·채용·제3자 링크는 편의를 위한 것이며, 외부 사이트의 내용·가용성·개인정보 처리는 해당 사이트가 책임집니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">5. 파트너·추천·제휴 링크</h2><p>CampCareer는 검증된 학교, 에이전시, 보험, 송금, 통신, 숙소 서비스 등의 링크를 명확히 표시할 수 있습니다. 상업적 관계는 순위나 근거를 바꾸지 않습니다. 이용자가 요청 화면에서 특정 동의한 경우에만 지원 요청을 파트너와 공유합니다. 파트너와 맺는 계약은 이용자와 파트너 간의 직접 계약입니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">6. 종료된 호주 리포트 기록</h2><p>CampCareer는 더 이상 호주 리포트를 판매하거나 리포트 준비·출시 알림 등록을 받지 않습니다. 과거 기록은 개인정보 처리방침에 따라 보관 또는 삭제합니다. 리포트 구매·전달·전문가 검토·자동 비자 자격 판정 서비스는 제공하지 않습니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">7. 허용되는 이용</h2><p>다른 이용자의 데이터에 접근하려 하거나, 서비스를 저해할 정도로 자동 수집을 하거나, 서비스 운영을 방해해서는 안 됩니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">8. 가용성과 변경</h2><p>서비스는 어떠한 보증 없이 제공됩니다. 기능은 언제든 수정·중단될 수 있으며, 약관이 바뀐 뒤 계속 이용하면 변경된 약관에 동의한 것으로 봅니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">9. 책임 제한</h2><p>법이 허용하는 최대 범위에서 CampCareer는 추정 데이터에 의존해 내린 결정이나 서비스 이용으로 발생한 간접·결과적 손해에 책임지지 않습니다.</p></section>
        <section><h2 className="font-display mb-2 text-lg font-semibold text-slate-800">10. 문의</h2><p>약관 관련 문의는 <a href="mailto:leeyaehun@gmail.com" className="text-blue-600 hover:underline">leeyaehun@gmail.com</a>으로 보내주세요.</p></section>
      </div>
      <div className="mt-12 border-t border-slate-200 pt-6 text-sm"><Link href="/ko/privacy" className="text-blue-600 hover:underline">개인정보 처리방침</Link></div>
    </div>
  )
}
