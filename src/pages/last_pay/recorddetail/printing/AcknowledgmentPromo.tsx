import { formatCurrency, formatAmountInWords } from "@/helpers/currency";
import { useLastPayContext } from "@/contexts/LastPayContext";

export default function AcknowledgmentPromo() {
  const { record: data } = useLastPayContext();
  

  return (
    <div className="min-h-screen bg-gray-300 flex items-start justify-center print:bg-white print:p-0 print:block">
      <div
        className="bg-white shadow-lg print:shadow-none font-sans text-black"
        style={{
          width: "816px",
          minHeight: "1056px",
          padding: "72px 80px",
          fontSize: "13px",
          lineHeight: "1.5",
        }}
      >
        {/* TITLE */}
        <p className="text-center font-bold tracking-widest mb-[18px] text-[15px]">
          QUITCLAIM AND RELEASE
        </p>
        {/* Opening paragraph */}
        <p className="mb-0">
          I, <strong>{data?.emp_name || "N/A"}</strong>, of legal age, Filipino,
          residing at [Address to be filled]
        </p>
        <p className="text-left text-[12px] mb-4">
          (ako)
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(nasa
          hustong gulang at nakatira sa
        </p>
        for and in consideration of the amount of{" "}
        <strong>{formatAmountInWords(Number(data.net_pay ?? 0))} PESOS ONLY</strong>
        <strong> (Php {formatCurrency(Number(data.net_pay ?? 0))})</strong>, do hereby
        release and discharge <strong>EXXEL PRIME INT'L. TRADING INC.</strong>{" "}
        and its officer/s, person/s from any monetary claim by way of unpaid
        wages, salaries, separation pay, overtime pay, 13th month pay,
        commissions, or otherwise as may due to me in connection with my
        employment in this company. I hereby state further that I have no more
        claim, right or action of whatsoever nature whether past, present or
        contingent against the said respondent and/or its officers.
        {/* Financial breakdown table */}
        <table className="w-full border-collapse mb-[14px] text-[13px]">
          <tbody>
            <tr>
              <td className="pl-32 pb-[2px]">SALARY</td>
              <td className="text-right pr-32 pb-[2px]">
                {formatCurrency(Number(data.last_pay ?? 0))}
              </td>
            </tr>
            <tr>
              <td className="pl-32 pb-[2px]">13TH MONTH PAY</td>
              <td className="text-right pr-32 pb-[2px]">
                {formatCurrency(Number(data.lp_total_tm ?? 0))}
              </td>
            </tr>
            {/* Line Item Payables */}
            {data?.payables && data.payables.length > 0 && (
              <>
                {data.payables.map((payable, index) => (
                  <tr key={payable.ad_type_id || index}>
                    <td className="pl-32 pb-[2px]">{payable.description}</td>
                    <td className="text-right pr-32 pb-[2px]">
                      {formatCurrency(Number(payable.amount))}
                    </td>
                  </tr>
                ))}
              </>
            )}
            <tr className="border-t border-black">
              <td className="pl-32 pt-[2px] pb-[8px] font-bold">TOTAL CLAIM</td>
              <td className="text-right pr-32 pt-[2px] pb-[8px] font-bold">
                {formatCurrency(Number(data.gross_amount_computed ?? 0))}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="pl-32 pb-[2px]">
                LESS: DEDUCTIONS
              </td>
            </tr>
            {data?.deductions && data.deductions.length > 0 && (
              <>
                {data.deductions.map((deduction, index) => (
                  <tr key={deduction.ad_type_id || index}>
                    <td className="pl-40 pb-[2px]">{deduction.description}</td>
                    <td className="text-right pr-32 pb-[2px]">
                      {formatCurrency(Number(deduction.amount))}
                    </td>
                  </tr>
                ))}
              </>
            )}
            <tr className="border-t border-black">
              <td className="pl-32 pt-[2px] pb-[8px] font-bold">
                TOTAL DEDUCTIONS
              </td>
              <td className="text-right pr-32 pt-[2px] pb-[8px] font-bold">
                {formatCurrency(Number(data.total_deductions_computed ?? 0))}
              </td>
            </tr>
            <tr
              className="border-t border-black border-b-[3px] border-b-black"
              style={{ borderBottomStyle: "double" }}
            >
              <td className="pl-32 pt-[2px] pb-1 font-bold">
                TOTAL NET AMOUNT OF CLAIM
              </td>
              <td className="text-right pr-32 pt-[2px] pb-1 font-bold">
                {formatCurrency(Number(data.net_pay ?? 0))}
              </td>
            </tr>
          </tbody>
        </table>
        {/* Filipino translation block */}
        <p className="text-justify text-[12px] mb-2">
          (ay aking pinawawalang-saysay at tinatalikdan ang{" "}
          <strong>EXXEL PRIME INT'L. TRADING INC.</strong> at ang mga tauhan
          nito mula sa anumang paghahabol na nauukol sa pananalapi sa
          pamamagitan ng di nababayarang sahod, buwanang sahod, o anupaman na
          karapat dapat para sa akin na may kaugnay sa aking kompanyang
          pinapasukan. Aking idinideklara na wala na akong anumang karapatang
          maghabol, gumawa ng aksiyon at kung anu pa man mag mula noong,
          kasalukuyan laban sa kompanya at sa mga tauhan nito)
        </p>
        {/* Voluntary execution */}
        <p className="mb-0">
          &nbsp;&nbsp;&nbsp;&nbsp;I am executing this Quitclaim and Release,
          freely and voluntarily without any force or duress.
        </p>
        <p className="text-justify text-[12px] mb-2">
          (Isinagawa ko ang Pagtalikod at Papawalang-saysay na ito na may
          kalayaan at kusang-loob at walang pamimilit o pamumuwersa)
        </p>
        {/* IN VIEW WHEREOF */}
        <p className="mb-0">
          &nbsp;&nbsp;&nbsp;&nbsp;IN VIEW WHEREOF, I hereunto set my hand this
          _______ day of ___________________ in ___________________.
        </p>
        <p className="text-left text-[12px] mb-8">
          (DAHIL DITO, ako ay lumagda ngayong araw ng ______________________ sa
          ___________________________.
        </p>
        {/* Signature */}
        <div className="flex justify-end mb-6 mt-24">
          <div className="text-center">
            <div className="border-b border-black w-[220px] mb-1"></div>
            <p className="font-bold m-0 text-[13px]">
              {data?.emp_name || "N/A"}
            </p>
          </div>
        </div>
        {/* Horizontal rule before ACKNOWLEDGEMENT */}
        <hr className="border-t border-gray-400 mb-5" />
        {/* ACKNOWLEDGEMENT */}
        <p className="text-center font-bold underline tracking-widest mb-[14px] text-[13px]">
          ACKNOWLEDGEMENT
        </p>
        {/* Republic / Quezon City */}
        <table className="w-[60%] mb-[14px] text-[13px] border-collapse">
          <tbody>
            <tr>
              <td>Republic of the Philippines</td>
            </tr>
          </tbody>
        </table>
        {/* BEFORE ME paragraph */}
        <p className="text-justify mb-5">
          &nbsp;&nbsp;&nbsp;&nbsp;BEFORE ME, a Notary Public for and in
          _______________________, this _____ day of _____________________,
          with proof of Government ID No. _______________________ known to me
          and to me known to be the same person who executed the foregoing
          instrument and acknowledged to me that the same is his/her own free
          and voluntary act and deed.
        </p>
        {/* WITNESS MY HAND */}
        <p className="text-justify mb-10">
          &nbsp;&nbsp;&nbsp;&nbsp;WITNESS MY HAND SEAL on the date and at the
          place above-written.
        </p>
        {/* NOTARY PUBLIC signature */}
        <div className="flex justify-start mb-5">
          <div className="text-center">
            <div className="border-b border-black w-[220px] mb-1"></div>
            <p className="font-bold m-0 text-[13px]">NOTARY PUBLIC</p>
          </div>
        </div>
        {/* Doc / Page / Book / Series */}
        <div className="text-[12px] leading-[1.8] mt-[10px]">
          <p className="m-0">Doc No _____</p>
          <p className="m-0">Page No _____</p>
          <p className="m-0">Book No _____</p>
          <p className="m-0">Series of _____</p>
        </div>
        {/* Palawan Express consent */}
        <p className="text-justify py-[95px]">
          This is to allow <strong>{data?.comp_name || data?.comp_id || "the Company"}</strong> to
          send my Last and Final Monetary Claim from the company thru Palawan
          Express Pera Padala.
        </p>
        {/* Second Signature */}
        <div className="flex justify-end">
          <div className="text-center">
            <div className="border-b border-black w-[220px] mb-1"></div>
            <p className="font-bold text-[13px]">{data?.emp_name || "N/A"}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; background: white; }
          @page { margin: 0.75in; size: legal; }
        }
      `}</style>
    </div>
  );
}
