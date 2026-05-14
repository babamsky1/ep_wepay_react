export default function GeneralVoucher() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="bg-white border-2 border-gray-800 w-full max-w-3xl text-xs">
        {/* HEADER */}
        <div className="text-center px-3 py-2 border-b-2 border-gray-800">
          <div className="text-lg font-black uppercase tracking-wide">
            Exxel Prime Int'l. Trading Inc.
          </div>
          <div className="text-xs mt-0.5">
            14 FEMA ROAD, PROJECT 8, BRGY. BAHAY TORO, Q.C.
          </div>
          <div className="text-xs">
            Tel. No.: (02) 83742096 / 82530457 &bull; Cell No.: 0917-8385859
          </div>
        </div>

        {/* TITLE ROW */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 border-b-2 border-gray-800">
          <span className="text-2xl font-black uppercase tracking-widest">
            General Voucher
          </span>
          <span className="text-2xl font-black ml-1">No.</span>
          <span className="text-2xl font-bold text-orange-600 border-b-2 border-gray-800 min-w-20 inline-block">
            &nbsp;
          </span>
        </div>

        {/* PAYEE / NO */}
        <div className="flex border-b-2 border-gray-800">
          <div className="flex-1 px-3 py-1.5">
            <div className="font-bold text-xs">Payee/Supplier:</div>
            <div className="font-bold italic text-sm min-h-5">&nbsp;</div>
          </div>
          <div className="border-l-2 border-gray-800 px-3 py-1.5 w-44">
            <div className="font-bold text-xs">No.</div>
          </div>
        </div>

        {/* ADDRESS / DATE */}
        <div className="flex">
          <div className="flex-1 px-3 py-1.5">
            <div className="font-bold text-xs">Address:</div>
            <div className="font-bold italic text-sm min-h-5">&nbsp;</div>
          </div>
          <div className="border-l-2 border-gray-800 px-3 py-1.5 w-44">
            <div className="font-bold text-xs">Date</div>
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="flex border-t-2 border-b-2 border-gray-800">
          <div className="flex-1 border-r-2 border-gray-800 text-center font-black uppercase py-1.5 tracking-wide text-xs">
            Particular
          </div>
          <div className="w-36 border-r-2 border-gray-800 text-center font-black uppercase py-1.5 tracking-wide text-xs">
            Debit
          </div>
          <div className="w-36 text-center font-black uppercase py-1.5 tracking-wide text-xs">
            Credit
          </div>
        </div>

        {/* TABLE BODY */}
        <div
          className="flex border-b-2 border-gray-800"
          style={{ minHeight: "240px" }}
        >
          {/* PARTICULARS */}
          <div
            className="flex-1 border-r-2 border-gray-800 px-3 py-2 font-bold italic uppercase"
            style={{ fontSize: "11.5px" }}
          >
            <div className="leading-loose">
              <div className="min-h-5">&nbsp;</div>
              <div className="min-h-5">&nbsp;</div>
              <div className="min-h-5">&nbsp;</div>
              <div className="min-h-5">&nbsp;</div>
            </div>
            <div className="h-8" />
            <div className="leading-loose">
              <div className="min-h-5">&nbsp;</div>
              <div className="min-h-5">&nbsp;</div>
            </div>
          </div>

          {/* DEBIT */}
          <div className="w-36 border-r-2 border-gray-800 flex flex-col text-center text-xs">
            <div className="flex-1 px-2 pt-2"></div>
          </div>

          {/* CREDIT */}
          <div className="w-36 flex flex-col text-center text-xs">
            <div className="flex-1 px-2 pt-2"></div>
          </div>
        </div>

        {/* CHEQUE REFERENCE ROW */}
        <div className="flex border-gray-800 text-xs">
          <div
            className="flex items-center gap-1 px-2 py-1.5 border-r-2 border-gray-800"
            style={{ flex: 1.8 }}
          >
            <span className="font-bold whitespace-nowrap">
              Cheque Reference:
            </span>
            <span className="whitespace-nowrap">Amount P</span>
            <div className=" border-gray-800 min-w-16 min-h-4">&nbsp;</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 border-r-2 border-gray-800 flex-1">
            <span className="font-bold">Bank:</span>
            <div className=" border-gray-800 flex-1 min-h-4">&nbsp;</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 border-r-2 border-gray-800 w-36">
            <span className="font-bold">No.</span>
            <div className=" border-gray-800 flex-1 min-h-4">&nbsp;</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 w-36">
            <span className="font-bold">Date:</span>
            <div className=" border-gray-800 flex-1 min-h-4">&nbsp;</div>
          </div>
        </div>

        {/* SIGNATURE ROW */}
        <div className="flex border-t-2 border-gray-800 text-xs">
          {/* Prepared by */}
          <div className="flex-1 border-r-2 border-gray-800 px-3 py-1">
            <div className="font-bold mb-3">Prepared by:</div>
            <div className="font-bold italic uppercase min-h-4">&nbsp;</div>
            <div className="border-t-2 border-gray-800 mt-1 pt-1 min-h-4"></div>
          </div>

          {/* Approved by */}
          <div className="flex-1 border-r-2 border-gray-800 px-3 py-1">
            <div className="font-bold mb-3">Approved by:</div>
            <div className="font-bold italic uppercase min-h-4">&nbsp;</div>
            <div className="border-t-2 border-gray-800 mt-1 pt-1 min-h-4"></div>
          </div>

          {/* Received by */}
          <div className="px-3 py-1" style={{ flex: 3.3 }}>
            <div className="font-bold text-sm mb-2">Received by:</div>
            <div className="flex items-end gap-4">
              {/* Signature Field */}
              <div className="flex flex-col items-center" style={{ flex: 2 }}>
                <div className="border-b-2 border-gray-800 w-full min-h-4">
                  &nbsp;
                </div>
                <div className="text-xs font-bold tracking-tight mt-0.5">
                  Signature over printed name
                </div>
              </div>

              {/* O.R. Field */}
              <div
                className="flex items-end gap-1"
                style={{ flex: 1.5, paddingBottom: "1.15rem" }}
              >
                <span className="text-sm font-bold whitespace-nowrap">
                  O.R.
                </span>
                <div className="border-b-2 border-gray-800 min-h-4 w-full">
                  &nbsp;
                </div>
              </div>

              {/* Date Field */}
              <div
                className="flex items-end gap-1"
                style={{ flex: 1.5, paddingBottom: "1.15rem" }}
              >
                <span className="text-sm font-bold whitespace-nowrap">
                  Date
                </span>
                <div className="border-b-2 border-gray-800 min-h-4 w-full">
                  &nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
