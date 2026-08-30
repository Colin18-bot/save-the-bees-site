import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

function formatDateTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AsianHornetDrafts() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [deletingId, setDeletingId] =
    useState(null);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: draftRows,
        error: draftError,
      } = await supabase
        .from("asian_hornet_observations")
        .select(`
          id,
          observed_at,
          latitude,
          longitude,
          location_text,
          created_at
        `)
        .eq("record_status", "draft")
        .order("created_at", {
          ascending: false,
        });

      if (draftError) {
        throw draftError;
      }

      const rows = draftRows || [];

      if (rows.length === 0) {
        setDrafts([]);
        setLoading(false);
        return;
      }

      const ids = rows.map((row) => row.id);

      const {
        data: photoRows,
        error: photoError,
      } = await supabase
        .from(
          "asian_hornet_observation_photos"
        )
        .select(`
          id,
          observation_id,
          original_path,
          report_path,
          sort_order
        `)
        .in("observation_id", ids)
        .order("sort_order");

      if (photoError) {
        throw photoError;
      }

      const photosByObservation = {};

      for (const photo of photoRows || []) {
        if (
          !photosByObservation[
            photo.observation_id
          ]
        ) {
          photosByObservation[
            photo.observation_id
          ] = [];
        }

        photosByObservation[
          photo.observation_id
        ].push(photo);
      }

      const preparedDrafts =
        await Promise.all(
          rows.map(async (draft) => {
            const photos =
              photosByObservation[
                draft.id
              ] || [];

            const firstPhoto =
              photos[0] || null;

            let thumbnailUrl = null;

            if (firstPhoto?.original_path) {
              const {
                data: signed,
              } =
                await supabase.storage
                  .from("asian-hornet")
                  .createSignedUrl(
                    firstPhoto.original_path,
                    60 * 60
                  );

              thumbnailUrl =
                signed?.signedUrl ||
                null;
            }

            return {
              ...draft,
              photos,
              photoCount:
                photos.length,
              thumbnailUrl,
            };
          })
        );

      setDrafts(preparedDrafts);
    } catch (error) {
      console.error(
        "Load Asian Hornet drafts:",
        error
      );

      setErrorMessage(
        "Your unfinished Asian Hornet observations could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  async function discardDraft(draft) {
    const confirmed =
      window.confirm(
        "Discard this unfinished observation? Its photographs and draft record will be permanently deleted."
      );

    if (!confirmed) return;

    setDeletingId(draft.id);

    try {
      const paths = [];

      for (const photo of draft.photos) {
        if (photo.original_path) {
          paths.push(
            photo.original_path
          );
        }

        if (
          photo.report_path &&
          photo.report_path !==
            photo.original_path
        ) {
          paths.push(
            photo.report_path
          );
        }
      }

      if (paths.length > 0) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("asian-hornet")
          .remove(paths);

        if (storageError) {
          throw storageError;
        }
      }

      const {
        error: deleteError,
      } = await supabase
        .from(
          "asian_hornet_observations"
        )
        .delete()
        .eq("id", draft.id)
        .eq(
          "record_status",
          "draft"
        );

      if (deleteError) {
        throw deleteError;
      }

      setDrafts((current) =>
        current.filter(
          (item) =>
            item.id !== draft.id
        )
      );
    } catch (error) {
      console.error(
        "Discard Asian Hornet draft:",
        error
      );

      window.alert(
        "The unfinished observation could not be discarded."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return null;
  }

  if (errorMessage) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (drafts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-amber-700">
          Unfinished
        </p>

        <h2 className="mt-1 text-xl font-bold text-gray-900">
          {drafts.length === 1
            ? "1 unfinished sighting"
            : `${drafts.length} unfinished sightings`}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-700">
          You started these Asian Hornet
          observations but did not finish
          saving the sighting details.
          Continue where you left off or
          discard the draft.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="h-20 w-20 flex-none overflow-hidden rounded-lg bg-gray-100">
              {draft.thumbnailUrl ? (
                <img
                  src={
                    draft.thumbnailUrl
                  }
                  alt="Unfinished Asian Hornet observation"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-500">
                  No photo
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">
                Unfinished observation
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {formatDateTime(
                  draft.observed_at ||
                    draft.created_at
                )}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {draft.photoCount === 1
                  ? "1 photograph saved"
                  : `${draft.photoCount} photographs saved`}
              </p>

              {draft.latitude != null &&
                draft.longitude !=
                  null && (
                  <p className="mt-1 text-xs text-gray-500">
                    GPS location saved
                  </p>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/asian-hornet/observation/${draft.id}/details`
                  )
                }
                className="rounded-lg bg-[#1a3329] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24483a]"
              >
                Continue
              </button>

              <button
                type="button"
                disabled={
                  deletingId ===
                  draft.id
                }
                onClick={() =>
                  discardDraft(draft)
                }
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId ===
                draft.id
                  ? "Discarding…"
                  : "Discard"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}