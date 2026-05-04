<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $template = Template::first();
        if (!$template) {
            return response()->json(['content' => null]);
        }
        return response()->json($template);
    }

    /**
     * Store or update the template.
     */
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string'
        ]);

        $template = Template::first();
        
        if ($template) {
            $template->update(['content' => $request->content]);
        } else {
            $template = Template::create([
                'nama' => 'Default Template',
                'content' => $request->content
            ]);
        }

        return response()->json(['message' => 'Template saved successfully', 'template' => $template]);
    }
}
