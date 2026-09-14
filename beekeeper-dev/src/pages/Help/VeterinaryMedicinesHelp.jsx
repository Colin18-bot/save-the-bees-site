import React from "react";
import { Link } from "react-router-dom";

function AvailabilityBadge() {
  return (
    <span className="inline-flex items-center rounded border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900">
      Free &amp; Premium
    </span>
  );
}

export default function VeterinaryMedicinesHelp() {
  return (
    <section id="veterinary-medicines">
      <h2 className="text-2xl font-bold mb-3">
        Veterinary Medicines <AvailabilityBadge />
      </h2>

      <p className="mb-4 text-gray-700">
        Veterinary Medicines is available to <strong>both Free and Premium members</strong>.
      </p>

      <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-gray-800">
        <div className="font-semibold">Important</div>
        <p className="mt-1">
          HiveTag is a record-keeping tool. It does not prescribe veterinary medicines or decide
          which product, dose, treatment duration, withdrawal period, removal date or treatment
          protocol you should use. Enter the information that applies to the medicine you are
          actually using and follow the current product instructions and applicable official
          guidance.
        </p>
      </div>

      <p className="mt-4 text-gray-700">
        Veterinary Medicines keeps the <strong>medicine purchase record</strong> separate from the
        <strong> treatment records</strong> created when that medicine is administered to one or
        more hives. This lets you keep a clear history of what was bought, what was used, where it
        was used, when treatment started and finished, and what unused medicine was later disposed
        of.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">1. Record-holder details</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
            <li>Open <strong>Veterinary Medicines</strong> from the sidebar.</li>
            <li>Enter the beekeeper / record-holder name, address and postcode.</li>
            <li>These current details are used for new medicine records.</li>
            <li>
              Existing historical records keep the record-holder details that applied when they
              were created; changing the current details does not rewrite old records.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">2. Add a medicine purchase</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
            <li>Use <strong>+ Add Medicine</strong>.</li>
            <li>
              Record the product, supplier, purchase date, batch number and quantity purchased.
            </li>
            <li>Expiry date and invoice/reference can also be recorded where available.</li>
            <li>
              A medicine purchase is the source record. Treatments and disposal records are linked
              back to that purchase.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">3. Record a treatment</h3>
        <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
          <li>Choose <strong>Record Treatment</strong>.</li>
          <li>Select the medicine purchase and the apiary.</li>
          <li>Select one or more hives that received that treatment.</li>
          <li>
            Enter what the treatment was used for, the method, treatment start date and the person
            administering it.
          </li>
          <li>
            Enter <strong>Quantity used per hive</strong>. This is the amount administered to each
            selected hive; HiveTag does not divide one total quantity between the selected hives.
          </li>
          <li>
            Enter the withdrawal period that applies to the product. For example, if the product
            information states <strong>Honey: zero days</strong>, record that information as it
            applies to the product. A zero-day withdrawal period does not override separate product
            restrictions such as honey-flow, super-removal or harvest instructions.
          </li>
          <li>
            Choose whether this was a <strong>one-off administration</strong> or a treatment that
            <strong> remains in the hive</strong>.
          </li>
        </ol>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">One-off administration</h3>
          <p className="mt-2 text-gray-700">
            Use this when the treatment is administered and completed on the same date, for example
            a one-off drizzle/trickle treatment where no future removal or completion date is needed.
            HiveTag records the treatment as <strong>Completed</strong> on the administration date
            and does not create a future removal event.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">Treatment remains in the hive</h3>
          <p className="mt-2 text-gray-700">
            Use this when the product remains in the colony for a period of time. Enter the planned
            removal/completion date and whether the later action is to <strong>Remove</strong> or
            <strong>Complete</strong>. The treatment stays <strong>Active</strong> until you record
            its actual completion.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Inspection linkage</h3>
        <p className="mt-2 text-gray-700">
          A veterinary treatment remains its own medicine record; HiveTag does not turn it into a
          false inspection. For each treated hive, HiveTag links the treatment to the most recent
          inspection for that hive on or before the treatment start date. The card is headed
          <strong> Veterinary treatment linked to this inspection</strong> so it is clear that the
          treatment record is associated with that inspection rather than claiming it was necessarily
          administered during the inspection itself.
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
          <li>The treatment appears on one relevant inspection only.</li>
          <li>Later inspections do not move the treatment away from the original linked inspection.</li>
          <li>
            If no inspection exists on or before the treatment start date, the treatment remains a
            valid medicine record but has no inspection card.
          </li>
          <li>
            Completed treatments stay visible on the linked inspection as historical records rather
            than disappearing.
          </li>
        </ul>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Completing an active treatment</h3>
        <p className="mt-2 text-gray-700">
          An active treatment can be completed from its linked inspection card. Enter the actual
          completion/removal date and mark it completed. The treatment stays linked to the same
          inspection and its status changes from <strong>Active</strong> to <strong>Completed</strong>.
        </p>
        <p className="mt-2 text-gray-700">
          For a treatment applied to several hives, each hive can have its own actual completion date.
          This is useful where strips or other treatments are removed from different colonies on
          different days.
        </p>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Overdue treatments</h3>
        <p className="mt-2 text-gray-700">
          If a treatment is still active after the planned removal/completion date, HiveTag marks it
          as overdue. The linked inspection card shows the overdue warning and the Calendar gives
          overdue treatments priority so they are easier to spot. Once the treatment is completed,
          the overdue warning clears while the planned and actual dates remain in the history.
        </p>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Calendar</h3>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
          <li>Treatment start dates appear in the Calendar.</li>
          <li>Active treatments can show their planned removal/completion date.</li>
          <li>Actual completion is preserved when the treatment is completed.</li>
          <li>Overdue active treatments are highlighted and prioritised on busy days.</li>
          <li>
            When a day contains more entries than can be shown in the month cell, use
            <strong> View all</strong> to open the full-day list.
          </li>
          <li>
            Opening an event&apos;s <strong>Details</strong> from that list keeps the day list open
            underneath. Closing the detail returns you to the same day list until you close it.
          </li>
        </ul>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Amending a medicine or treatment</h3>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
          <li>
            Use <strong>Edit medicine</strong> to correct purchase details such as supplier,
            invoice/reference, batch or quantity purchased.
          </li>
          <li>
            Use <strong>Amend</strong> on a treatment-history card to correct treatment information.
          </li>
          <li>
            An amendment updates the existing record rather than creating a duplicate treatment.
          </li>
          <li>
            If the treatment date or selected hives are corrected, HiveTag can recalculate the
            relevant inspection linkage using the corrected information.
          </li>
        </ul>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Disposal of unused medicine</h3>
        <p className="mt-2 text-gray-700">
          Disposal is for <strong>medicine that was not administered</strong>, such as unused,
          expired or damaged medicine that you later dispose of or return. It is not the same as
          removing a treatment from a hive after it has been administered.
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
          <li>
            Record the <strong>date disposed</strong>, <strong>quantity disposed</strong> and the
            <strong> route/method of disposal</strong>. Notes are optional.
          </li>
          <li>
            The same medicine purchase can have more than one disposal event, for example if unused
            medicine is disposed of in separate quantities on different dates.
          </li>
          <li>Each disposal record can be amended independently.</li>
          <li>
            If all of the purchased medicine was administered and there is nothing unused to dispose
            of, do not create a disposal record. The printout will simply state that no disposal of
            unused medicine was recorded.
          </li>
        </ul>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Printing and saving records as PDF</h3>
        <p className="mt-2 text-gray-700">
          Use <strong>Print / PDF</strong> from Veterinary Medicines. HiveTag opens a dedicated
          print document designed for the medicine register rather than printing the live app screen.
          This keeps the document cleaner and makes pagination more reliable as the record grows.
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
          <li>Medicine purchase details are shown with the relevant administration history.</li>
          <li>Quantity used is shown per hive.</li>
          <li>Planned and actual completion information is preserved.</li>
          <li>Disposal of unused medicine is shown separately, including quantity disposed.</li>
          <li>
            Long administration histories can continue across pages with repeated table headings,
            while individual treatment and disposal rows are kept together where the browser allows.
          </li>
          <li>You can print the document or use your browser&apos;s <strong>Save as PDF</strong> option.</li>
        </ul>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Record retention and deleting your account</h3>
        <p className="mt-2 text-gray-700">
          HiveTag provides the tools to record, review and print/export your veterinary medicine
          history, but you remain responsible for keeping whatever records are required for your
          circumstances and for the required period. If you intend to delete your HiveTag account,
          save or print any veterinary medicine records you still need before deleting the account.
        </p>
      </div>

      <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <div className="font-semibold">Quick distinction</div>
        <p className="mt-1">
          <strong>Treatment removal/completion</strong> means a treatment that was already
          administered to the hive has reached its actual end/removal date. <strong>Disposal</strong>
          means unused medicine that was never administered has been disposed of or returned.
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Quick link:{" "}
        <Link to="/veterinary-medicines" className="text-blue-700 underline">
          Open Veterinary Medicines
        </Link>
      </div>
    </section>
  );
}
