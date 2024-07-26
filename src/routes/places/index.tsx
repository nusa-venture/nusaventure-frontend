/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeaturedPlace, Place } from "@/types/places";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { MapRef, PointLike, Source } from "react-map-gl";
import Layer from "react-map-gl/dist/esm/components/layer";
import {
  Form,
  Link,
  LoaderFunctionArgs,
  useLoaderData,
} from "react-router-dom";

import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/libs/api";
import NusaVentureLogo from "/images/places/nusa-venture-black.svg";

type responsePlaces = { data: Array<Place> };

import { useRef } from "react";

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export async function loader({ request }: LoaderFunctionArgs) {
  const keyword = new URL(request.url).searchParams.get("q");

  const [responsePlaces, responseTopDestinations] = await Promise.all([
    api<responsePlaces>(`places?search=${keyword ?? ""}`),
    api<{ data: Array<FeaturedPlace> }>("/places/featured"),
  ]);

  return {
    keyword: keyword ?? "",
    places: responsePlaces.data,
    topDestinations: responseTopDestinations.data,
  };
}

export function PlacesIndexRoute() {
  const { places, keyword } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  const mapRef = useRef<MapRef>(null);

  const geojson = {
    type: "FeatureCollection",
    features: places.map((place) => ({
      type: "Feature",
      properties: {
        title: place.title,
        id: place.id,
      },
      geometry: {
        type: "Point",
        coordinates: [place.longitude, place.latitude],
      },
    })),
  };

  const clusterLayer = {
    id: "clusters",
    type: "circle" as const,
    source: "places",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#4b0082", // Indigo color
        100,
        "#f1f075",
        750,
        "#f28cb1",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
  };

  const clusterCountLayer = {
    id: "cluster-count",
    type: "symbol" as const,
    source: "places",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#ffffff", // White color for the text
    },
  };

  const unclusteredPointLayer = {
    id: "unclustered-point",
    type: "circle" as const,
    source: "places",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#4b0082", // Indigo color
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  };

  const onClusterClick = (event: {
    point: PointLike | [PointLike, PointLike] | undefined;
  }) => {
    if (!mapRef.current) return;

    const features = mapRef.current.queryRenderedFeatures(event.point, {
      layers: ["clusters"],
    });

    if (!features.length) return;

    const feature = features[0];
    const clusterId = feature.properties?.cluster_id;
    const mapboxSource = mapRef.current.getSource("places") as any;

    if (!mapboxSource || clusterId === undefined) return;

    mapboxSource.getClusterExpansionZoom(
      clusterId,
      (err: any, zoom: number) => {
        if (err || !mapRef.current) {
          return;
        }

        const geometry = feature.geometry;

        // Check if the geometry type is 'Point'
        if (geometry.type === "Point") {
          const coordinates = geometry.coordinates as [number, number];

          mapRef.current.easeTo({
            center: coordinates,
            zoom: zoom,
          });
        }
      }
    );
  };

  return (
    <main className="flex">
      <aside className="w-[720px] h-screen flex flex-col">
        <PlacesSidebarHeader />
        <div className="p-6 h-[85%]">
          <PlaceDetailPlaceholder places={places} keyword={keyword} />
        </div>
      </aside>

      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={{
          latitude: -0.4752106,
          longitude: 116.6995672,
          zoom: 4.75,
        }}
        style={{ width: "70%", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onClick={onClusterClick}
      >
        <Source
          id="places"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </main>
  );
}

function PlacesSidebarHeader() {
  const { keyword } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <header className="px-6 py-4 flex justify-between items-center gap-6">
      <Link to="/">
        <img src={NusaVentureLogo} alt="Nusa Venture" className="h-10" />
      </Link>

      <Form method="get" action="/places" className="w-full">
        <Input
          type="search"
          name="q"
          placeholder="Search places..."
          defaultValue={keyword}
          className="focus-visible:ring-0 bg-neutral-200 focus-visible:ring-transparent"
        />
      </Form>

      <nav>
        <Button className="bg-primary-color text-white">
          <Link to="/login">Login</Link>
        </Button>
      </nav>
    </header>
  );
}

function PlaceDetailPlaceholder({
  places,
  keyword,
}: {
  places: Place[];
  keyword: string;
}) {
  return (
    <div className="h-[100%]">
      <p className="font-medium text-xl mb-6">Show result of "{keyword}"</p>

      <ScrollArea className="h-[100%]">
        {places.map((place, index) => (
          <div
            className="flex flex-row gap-4 mb-4 min-h-[145px] w-full"
            key={index}
          >
            <img
              className="object-cover rounded-lg w-[198px] h-[145px]"
              src={place.imageUrl}
              alt={place.title}
            />

            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              <p className="text-xl font-bold">{place.title}</p>

              <div className="flex flex-row gap-4 ">
                {place.categories.map((category, index) => (
                  <div
                    key={index}
                    className="px-[10px] py-[5px] bg-blue-200 rounded-3xl"
                  >
                    <p className="font-bold text-xs text-blue-600">
                      {category.name}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm font-medium text-gray-500 truncate text-ellipsis">
                {place.description}
              </p>
              <p className="text-sm font-medium text-gray-500 truncate text-ellipsis">
                {place.address}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
